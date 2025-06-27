document.addEventListener("DOMContentLoaded", () => {
    const storageKey = "selectedDrinks";
    let selectedDrinks = JSON.parse(localStorage.getItem(storageKey) || "{}");

    const listContainer = document.getElementById("selected-drinks-list");
    const quantityChart = document.getElementById("quantity-chart");
    const nutritionChart = document.getElementById("nutrition-chart");

    function renderDrinkList() {
        listContainer.innerHTML = "";

        const entries = Object.entries(selectedDrinks);
        if (entries.length === 0) {
            listContainer.innerHTML = "<p>Nicio băutură selectată.</p>";
            return;
        }

        entries.forEach(([id, drink]) => {
            const item = document.createElement("div");
            item.className = "drink-entry";
            item.innerHTML = `
        <span>${drink.name} (${drink.brand || "N/A"})</span>
        <i class="fa-solid fa-trash" data-id="${id}"></i>
      `;
            listContainer.appendChild(item);

            item.querySelector("i").addEventListener("click", () => {
                delete selectedDrinks[id];
                localStorage.setItem(storageKey, JSON.stringify(selectedDrinks));
                renderDrinkList();
                renderCharts();
                renderTagChart();
            });
        });
    }

    function downloadJSON() {
        const drinks = Object.values(selectedDrinks).map(drink => ({
            ...drink,
            tags: (drink.tags || [])
                .filter(t => t in allTagsMap)
                .map(t => allTagsMap[t])
        }));

        const blob = new Blob([JSON.stringify(drinks, null, 2)], { type: "application/json" });
        downloadBlob(blob, "drinks.json");
    }

    function downloadCSV() {
        const drinks = Object.values(selectedDrinks).map(drink => ({
            ...drink,
            tags: (drink.tags || [])
                .filter(t => t in allTagsMap)
                .map(t => allTagsMap[t])
                .join('; ')
        }));

        if (!drinks.length) return;

        const headers = Object.keys(drinks[0]);
        const rows = drinks.map(d => headers.map(h => JSON.stringify(d[h] ?? "")).join(","));
        const csv = [headers.join(","), ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        downloadBlob(blob, "drinks.csv");
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function renderCharts() {
        const drinks = Object.values(selectedDrinks);
        if (drinks.length <= 2) {
            quantityChart.innerHTML = `<p style="color:white">Selectează cel putin 3 băuturi.</p>`;
            nutritionChart.innerHTML = `<p style="color:white">Selectează cel putin 3 băuturi.</p>`;
            document.querySelectorAll('.download-pie-chart').forEach(el => {
                console.log(el)
                el.style.display = "none";
            });
            return;
        }

        renderPieChart(quantityChart, groupBy(drinks, d => d.quantity), "Cantitate");
        renderPieChart(nutritionChart, groupBy(drinks, d => d.nutrition_grade), "Grad Nutrițional");
    }

    function groupBy(array, keyFn) {
        const map = {};
        for (const item of array) {
            const key = keyFn(item) || "Unknown";
            map[key] = (map[key] || 0) + 1;
        }
        return map;
    }

    function renderPieChart(container, dataMap, labelText) {
        container.innerHTML = "";

        const heading = container.parentElement.querySelector("h3");
        if (heading) heading.textContent = labelText;
        const data = Object.entries(dataMap);
        const total = data.reduce((sum, [, val]) => sum + val, 0);
        const radius = 120;
        const padding = 60;
        const cx = radius + padding;
        const cy = radius + padding;
        const viewBoxSize = (radius + padding) * 2;
        let startAngle = 0;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        data.forEach(([key, count], i) => {
            let sliceAngle = 0;
            if (count != total) {
                sliceAngle = (count / total) * 2 * Math.PI;
            } else {
                sliceAngle = 2 * Math.PI - 0.0001;
            }
            const x1 = cx + radius * Math.cos(startAngle);
            const y1 = cy + radius * Math.sin(startAngle);
            const endAngle = startAngle + sliceAngle;
            const x2 = cx + radius * Math.cos(endAngle);
            const y2 = cy + radius * Math.sin(endAngle);
            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

            const pathData = [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
            ].join(" ");

            const color = `hsl(${(i * 60) % 360}, 70%, 60%)`;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            path.setAttribute("fill", color);
            path.setAttribute("stroke", "#fff");
            svg.appendChild(path);

            // Label
            const midAngle = startAngle + sliceAngle / 2;
            const labelX = cx + (radius + 30) * Math.cos(midAngle);
            const labelY = cy + (radius + 30) * Math.sin(midAngle);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", labelX);
            text.setAttribute("y", labelY);
            text.setAttribute("fill", "#fff");
            text.setAttribute("font-size", "14px");
            text.setAttribute("text-anchor", "middle");
            text.textContent = `${key} (${count})`;
            svg.appendChild(text);

            startAngle = endAngle;
        });

        container.appendChild(svg);
    }

    window.downloadJSON = downloadJSON;
    window.downloadCSV = downloadCSV;
    window.downloadSVG = (chartId, filename) => {
        const svgEl = document.getElementById(chartId).querySelector("svg");
        const blob = new Blob([svgEl.outerHTML], { type: "image/svg+xml" });
        downloadBlob(blob, filename);
    };

    renderDrinkList();
    renderCharts();
});

const API_BASE_URL = window.env.API_BASE_URL;
const token = localStorage.getItem("token");

async function fetchTagOptions() {
    const res = await fetch(`${API_BASE_URL}/drinks/filters`);
    if (!res.ok) throw new Error("Eroare la obținerea tag-urilor");
    const data = await res.json();
    return data.tags;
}

function countTagsAcrossSelectedDrinks(drinks, selectedTagIds) {
    const counts = {};
    selectedTagIds.forEach(tag => counts[tag] = 0);

    console.log("Calculating tag frequencies for selected tags:", selectedTagIds);
    console.log("Drinks being evaluated:", drinks);

    for (const drink of drinks) {
        if (!Array.isArray(drink.tags)) {
            console.warn("Drink has no tags array:", drink);
            continue;
        }

        selectedTagIds.forEach(tag => {
            if (drink.tags.includes(tag)) {
                counts[tag]++;
            }
        });
    }

    console.log("Computed tag counts:", counts);
    return counts;
}

function renderTagChart() {
    const form = document.getElementById("tag-form");
    const selectedTags = Array.from(form.querySelectorAll("input:checked")).map(cb => parseInt(cb.value));
    const drinks = Object.values(JSON.parse(localStorage.getItem("selectedDrinks") || "{}"));

    const container = document.getElementById("tag-bar-chart");
    if (drinks.length <= 2) {
        container.innerHTML = `<p style="color:black; background:white; padding:1rem;">Selectează cel puțin 3 băuturi pentru a vizualiza statisticile</p>`;
        document.querySelector('.download-bar-chart').style.display = "none";
        return;
    }

    const tagCounts = countTagsAcrossSelectedDrinks(drinks, selectedTags);
    const tagMap = Object.fromEntries(Array.from(form.querySelectorAll("input")).map(i => [parseInt(i.value), i.nextSibling.textContent.trim()]));
    renderBarChart(container, tagCounts, tagMap);
}

function renderBarChart(container, tagCounts, tagLabels) {
    console.log("Rendering bar chart...");
    console.log("tagCounts:", tagCounts);
    console.log("tagLabels:", tagLabels);

    container.innerHTML = "";

    if (Object.keys(tagCounts).length === 0) {
        container.innerHTML = "<p style='color: white;'>Selectează un tag.</p>";
        return;
    }

    const width = 400;
    const height = 250;
    const margin = 30;
    const barWidth = 40;
    const gap = 20;

    const keys = Object.keys(tagCounts);
    const maxVal = Math.max(...Object.values(tagCounts), 1);

    const svgWidth = keys.length * (barWidth + gap) + margin * 2;
    const svgHeight = height + margin * 2;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", 0);
    bg.setAttribute("y", 0);
    bg.setAttribute("width", svgWidth);
    bg.setAttribute("height", svgHeight);
    bg.setAttribute("fill", "white");
    svg.appendChild(bg);

    keys.forEach((tag, i) => {
        const value = tagCounts[tag];
        const x = margin + i * (barWidth + gap);
        const barHeight = (value / maxVal) * height;
        const y = svgHeight - margin - barHeight;

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", barHeight);
        rect.setAttribute("fill", `hsl(${(i * 60) % 360}, 70%, 60%)`);
        rect.setAttribute("stroke", "#222");
        svg.appendChild(rect);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x + barWidth / 2);
        label.setAttribute("y", svgHeight - 5);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "12px");
        label.setAttribute("fill", "#000");
        label.textContent = tagLabels[tag];
        svg.appendChild(label);
    });

    container.appendChild(svg);
}

async function setupTagSection() {
    const allTags = await fetchTagOptions();
    allTagsMap = Object.fromEntries(allTags.map(tag => [tag.id, tag.name]));

    const form = document.getElementById("tag-form");

    allTags.forEach(tag => {
        const label = document.createElement("label");
        label.innerHTML = `
    <input type="checkbox" value="${tag.id}" checked> ${tag.name}
    `;
        form.appendChild(label);
    });

    form.addEventListener("change", renderTagChart);
    form.dispatchEvent(new Event("change"));
}

setupTagSection();
