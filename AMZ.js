// ==UserScript==
// @name         Amazon – Filtre Gris Ultra Discret (MK15h)
// @namespace    http://tampermonkey.net/
// @version      15.7
// @description  Filtre gris réglable + logo Amazon toujours visible, panneau flottant au survol
// @match        https://www.amazon.fr/*
// @match        https://www.amazon.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const uiColor = "#D0D0D0";  // blanc-gris doux
    const sliderBorder = "#999";

    let saved = localStorage.getItem("amazonGrayIntensity");
    let grayIntensity = saved !== null ? parseInt(saved, 10) : 80;
    let currentFilter = grayIntensity > 0 ? "gris" : "none";

    function applyFilterTo(img) {
        if (!img) return;
        if (currentFilter === "gris" && grayIntensity > 0) {
            img.style.filter = "brightness(" + (100 - grayIntensity) + "%)";
        } else {
            img.style.filter = "";
        }
    }

    function applyFilterAll() {
        document.querySelectorAll("img").forEach(applyFilterTo);
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.tagName === "IMG") applyFilterTo(node);
                if (node.querySelectorAll) node.querySelectorAll("img").forEach(applyFilterTo);
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // --- Logo Amazon fixe ---
    const logo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    logo.setAttribute("viewBox", "0 0 200 100");
    logo.setAttribute("width", "24");
    logo.setAttribute("height", "24");
    logo.setAttribute("fill", "none");
    logo.setAttribute("stroke", uiColor);
    logo.setAttribute("stroke-width", "8");
    logo.style.position = "fixed";
    logo.style.bottom = "15px";
    logo.style.left = "15px";
    logo.style.cursor = "pointer";
    logo.style.zIndex = "999999";
    logo.style.flexShrink = "0";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M10,60 C60,100 140,100 190,60 L180,55 L190,60 L180,65");
    logo.appendChild(path);
    document.body.appendChild(logo);

    // --- Panneau flottant ---
    const panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.bottom = "45px"; // au-dessus du logo
    panel.style.left = "15px";
    panel.style.padding = "6px";
    panel.style.background = "rgba(51,51,51,0.88)";
    panel.style.borderRadius = "8px";
    panel.style.zIndex = "999998";
    panel.style.fontFamily = "Arial, sans-serif";
    panel.style.fontSize = "12px";
    panel.style.color = uiColor;
    panel.style.boxShadow = "0 2px 6px rgba(0,0,0,0.35)";
    panel.style.display = "none"; // caché par défaut
    panel.style.width = "200px";
    panel.style.transition = "opacity 0.2s ease";

    // Slider + valeur
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = grayIntensity;
    slider.style.width = "140px";
    slider.style.marginRight = "6px";
    slider.style.background = "transparent";

    const valueSpan = document.createElement("span");
    valueSpan.style.width = "28px";
    valueSpan.style.textAlign = "right";
    valueSpan.textContent = grayIntensity + "%";

    panel.appendChild(slider);
    panel.appendChild(valueSpan);
    document.body.appendChild(panel);

    // CSS slider
    const styleEl = document.createElement("style");
    styleEl.textContent = `
        input[type=range] {
            -webkit-appearance: none;
            height: 4px;
            border-radius: 3px;
            background: ${uiColor};
            border: 1px solid ${sliderBorder};
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: ${uiColor};
            border-radius: 50%;
            cursor: pointer;
            border: 1px solid ${sliderBorder};
        }
        input[type=range]::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: ${uiColor};
            border-radius: 50%;
            cursor: pointer;
            border: 1px solid ${sliderBorder};
        }
    `;
    document.head.appendChild(styleEl);

    // Slider événement
    slider.oninput = () => {
        grayIntensity = parseInt(slider.value, 10);
        valueSpan.textContent = grayIntensity + "%";
        currentFilter = grayIntensity > 0 ? "gris" : "none";
        localStorage.setItem("amazonGrayIntensity", grayIntensity);
        applyFilterAll();
    };

    // Afficher / masquer panneau au survol du logo
    logo.addEventListener("mouseenter", () => {
        panel.style.display = "flex";
        panel.style.opacity = "1";
    });
    logo.addEventListener("mouseleave", () => {
        // petit délai pour permettre de survoler le panneau sans qu'il disparaisse
        setTimeout(() => {
            if (!panel.matches(':hover') && !logo.matches(':hover')) {
                panel.style.display = "none";
            }
        }, 100);
    });
    panel.addEventListener("mouseleave", () => {
        panel.style.display = "none";
    });

    // Appliquer filtre initial
    applyFilterAll();
})();
