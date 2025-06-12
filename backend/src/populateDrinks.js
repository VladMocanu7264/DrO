require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');
const { sequelize, Drink, Tag, DrinkTag } = require('./database');

const LOG_DIR = './logs';
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

function getNextLogFilename() {
    const files = fs.readdirSync(LOG_DIR)
        .filter(f => f.startsWith('drink_log_run_') && f.endsWith('.csv'));
    const numbers = files.map(f => parseInt(f.split('_')[3])).filter(n => !isNaN(n));
    const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
    return path.join(LOG_DIR, `drink_log_run_${next}.csv`);
}

const LOG_FILE = getNextLogFilename();
const axiosInstance = axios.create({ timeout: 60000 });

function isAsciiOnly(text) {
    return /^[\x00-\x7F]*$/.test(text || '');
}

function hasEnglishCategoryTags(tags) {
    return Array.isArray(tags) && tags.some(tag => tag.startsWith('en:'));
}

function isAlcoholic(categories) {
    return Array.isArray(categories) && categories.includes('en:alcoholic-beverages');
}

function exceedsLimits(fields) {
    return (
        (fields.name && fields.name.length > 50) ||
        (fields.brand && fields.brand.length > 50) ||
        (fields.image_url && fields.image_url.length > 250) ||
        (fields.nutrition_grade && fields.nutrition_grade.length > 10) ||
        (fields.packaging && fields.packaging.length > 250)
    );
}

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndPopulateDrinks() {
    await sequelize.authenticate();
    await sequelize.sync();
    await DrinkTag.destroy({ where: {} });
    await Tag.destroy({ where: {} });
    await Drink.destroy({ where: {} });
    console.log('Database cleared.');

    let insertedCount = 0;
    let skippedCount = 0;
    const insertedDrinks = [];
    let page = 1;
    const retryQueue = [];

    while (true) {
        if (retryQueue.length > 0) {
            page = retryQueue.shift();
            console.log(`Retrying page ${page}...`);
        }

        const params = {
            action: 'process',
            tagtype_0: 'categories',
            tag_contains_0: 'contains',
            tag_0: 'non-alcoholic-beverages',
            page,
            page_size: 100,
            json: true,
            fields: 'code,product_name_en,product_name,brands,image_url,nutrition_grades,product_quantity,packaging,categories_tags'
        };

        try {
            console.log(`\nFetching page ${page}...`);
            const response = await axiosInstance.get('https://world.openfoodfacts.org/cgi/search.pl', { params });
            const products = response.data.products;

            if (!products || products.length === 0) {
                console.log("No more products to process.");
                break;
            }

            for (const p of products) {
                if (!p?.code || !hasEnglishCategoryTags(p.categories_tags) || isAlcoholic(p.categories_tags)) {
                    skippedCount++;
                    continue;
                }

                const name = p.product_name_en?.trim() || p.product_name?.trim();
                if (!name || !isAsciiOnly(name)) {
                    skippedCount++;
                    continue;
                }

                const fields = {
                    name,
                    brand: isAsciiOnly(p.brands) ? p.brands : null,
                    image_url: p.image_url || null,
                    nutrition_grade: p.nutrition_grades || null,
                    quantity: parseInt(p.product_quantity) || null,
                    packaging: p.packaging || null
                };

                if (fields.nutrition_grade && fields.nutrition_grade.length > 5) {
                    skippedCount++;
                    continue;
                }

                if (exceedsLimits(fields)) {
                    skippedCount++;
                    continue;
                }

                try {
                    const [drink, created] = await Drink.findOrCreate({
                        where: { id: p.code },
                        defaults: fields
                    });

                    if (created) {
                        const catTags = p.categories_tags.filter(tag => tag.startsWith('en:')).map(tag => tag.slice(3));

                        for (const tName of catTags) {
                            const [tag] = await Tag.findOrCreate({ where: { name: tName } });
                            await DrinkTag.findOrCreate({ where: { DrinkId: drink.id, TagId: tag.id } });
                        }

                        insertedCount++;
                        console.log(`Inserted: [${drink.id}] ${drink.name}`);

                        insertedDrinks.push({
                            id: drink.id,
                            name: drink.name,
                            brand: drink.brand,
                            image_url: drink.image_url,
                            nutrition_grade: drink.nutrition_grade,
                            quantity: drink.quantity,
                            packaging: drink.packaging,
                            categories: catTags.join('|')
                        });
                    }
                } catch (e) {
                    if (!/packaging/i.test(e.message)) console.error(`Insert error for ${p.code}:`, e.message);
                    skippedCount++;
                }
            }

            console.log(`Finished page ${page}`);
            page++;
        } catch (e) {
            if (e.response?.status === 429) {
                console.warn(`Rate limit at page ${page}, waiting…`);
                retryQueue.push(page);
                await wait(60000);
            } else if (e.response?.status === 500) {
                console.warn(`Server error on page ${page}, stopping.`);
                break;
            } else {
                console.error(`Error page ${page}:`, e.message);
            }
            page++;
        }

        await wait(3000);
    }

    const csv = parse(insertedDrinks, {
        fields: ['id', 'name', 'brand', 'image_url', 'nutrition_grade', 'quantity', 'packaging', 'categories']
    });

    fs.writeFileSync(LOG_FILE, csv);
    console.log(`\nInserted: ${insertedCount}, Skipped: ${skippedCount}`);
    console.log(`CSV log saved to ${LOG_FILE}`);
    await sequelize.close();
    console.log("DB connection closed.");
}

fetchAndPopulateDrinks();
