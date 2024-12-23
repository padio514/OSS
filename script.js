function convertColor() {
    const format1 = document.getElementById("format1").value;
    const colorInput = document.getElementById("colorInput").value.trim();
    const format2 = document.getElementById("format2").value;

    let intermediateRgb;
    let result;

    try {
        // Validate input color
        validateColorInput(format1, colorInput);

        //input to RGB
        switch (format1) {
            case "hex":
                intermediateRgb = hexToRgb(colorInput);
                break;
            case "rgb":
                const [r, g, b] = colorInput.split(",").map(Number);
                intermediateRgb = `rgb(${r}, ${g}, ${b})`;
                break;
            case "hsl":
                const [h, s, l] = colorInput.split(",").map(Number);
                intermediateRgb = hslToRgb(`hsl(${h}, ${s}%, ${l}%)`);
                break;
            case "cmyk":
                const [c, m, y, k] = colorInput.split(",").map(Number);
                intermediateRgb = cmykToRgb(`cmyk(${c}, ${m}, ${y}, ${k})`);
                break;
            default:
                throw new Error("Unsupported input format.");
        }

        //RGB to outbut format
        switch (format2) {
            case "hex":
                result = rgbToHex(intermediateRgb);
                break;
            case "rgb":
                result = intermediateRgb;
                break;
            case "hsl":
                result = rgbToHsl(intermediateRgb);
                break;
            case "cmyk":
                result = rgbToCmyk(intermediateRgb);
                break;
            default:
                throw new Error("Unsupported output format.");
        }

        // Display the result
        document.getElementById("result").innerText = result;

        // Show RGB color preview
        document.getElementById("colorPreview").style.backgroundColor = intermediateRgb;
    } catch (error) {
        document.getElementById("result").innerText = error.message || "Invalid input. Please check the format and try again.";
        document.getElementById("colorPreview").style.backgroundColor = "transparent";
    }
}


function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
}

function rgbToHex(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function rgbToHsl(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number).map(x => x / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function hslToRgb(hsl) {
    const [h, s, l] = hsl.match(/\d+/g).map(Number);
    const hFraction = h / 360, sFraction = s / 100, lFraction = l / 100;
    let r, g, b;

    if (sFraction === 0) {
        r = g = b = lFraction; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = lFraction < 0.5 ? lFraction * (1 + sFraction) : lFraction + sFraction - lFraction * sFraction;
        const p = 2 * lFraction - q;
        r = hue2rgb(p, q, hFraction + 1 / 3);
        g = hue2rgb(p, q, hFraction);
        b = hue2rgb(p, q, hFraction - 1 / 3);
    }

    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function rgbToCmyk(rgb) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number).map(x => x / 255);
    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;
    return `cmyk(${Math.round(c * 100)}, ${Math.round(m * 100)}, ${Math.round(y * 100)}, ${Math.round(k * 100)})`;
}

function cmykToRgb(cmyk) {
    const [c, m, y, k] = cmyk.match(/\d+/g).map(Number).map(x => x / 100);
    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));
    return `rgb(${r}, ${g}, ${b})`;
}

const tooltips = {
    hex: "HEX: A hexadecimal color code in the format #RRGGBB. Each component (R, G, B) is a two-digit hexadecimal number (00 to FF).",
    rgb: "RGB: A color in the format rgb(R, G, B). Each component (R, G, B) is a decimal number (0 to 255).",
    hsl: "HSL: A color in the format hsl(H, S%, L%). H (hue) is 0-360, S (saturation) and L (lightness) are percentages.",
    cmyk: "CMYK: A color in the format cmyk(C, M, Y, K). Each component (Cyan, Magenta, Yellow, Black) is a percentage (0-100)."
};

function updatePlaceholder() {
    const format = document.getElementById("format1").value;
    const placeholderMap = {
        hex: "e.g., #FF5733",
        rgb: "e.g., 255,87,51",
        hsl: "e.g., 360,100,50",
        cmyk: "e.g., 0,66,80,0"
    };
    document.getElementById("colorInput").placeholder = placeholderMap[format] || "Enter color value";
}

function showTooltip(id) {
    const format = document.getElementById(id).value;
    const tooltip = document.getElementById("tooltip");
    tooltip.textContent = tooltips[format] || "No description available.";
    const element = document.getElementById(id);
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
}

function hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    tooltip.textContent = "";
    tooltip.style.left = "-9999px";
    tooltip.style.top = "-9999px";
}

function toggleInstructions() {
    const instructions = document.getElementById("instructions");
    instructions.style.display = instructions.style.display === "none" || instructions.style.display === "" ? "block" : "none";
}

updatePlaceholder();

function validateColorInput(format, value) {
    switch (format) {
        case "hex":
            if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                throw new Error("Invalid HEX format. Use #RRGGBB.");
            }
            break;
        case "rgb":
            const rgbMatch = value.split(",").map(Number);
            if (rgbMatch.length !== 3 || rgbMatch.some(num => isNaN(num) || num < 0 || num > 255)) {
                throw new Error("Invalid RGB format. Use R,G,B where R, G, and B are 0-255.");
            }
            break;
        case "hsl":
            const hslMatch = value.split(",").map(Number);
            if (
                hslMatch.length !== 3 ||
                hslMatch[0] < 0 || hslMatch[0] > 360 ||
                hslMatch[1] < 0 || hslMatch[1] > 100 ||
                hslMatch[2] < 0 || hslMatch[2] > 100
            )
            {
                throw new Error("Invalid HSL format. Use H,S,L where H=0-360, S=0-100, L=0-100.");
            }
            break;
        case "cmyk":
            const cmykMatch = value.split(",").map(Number);
            if (
                cmykMatch.length !== 4 ||
                cmykMatch.some(num => isNaN(num) || num < 0 || num > 100)
            )
            {
                throw new Error("Invalid CMYK format. Use C,M,Y,K where C, M, Y, K are 0-100.");
            }
            break;
        default:
            throw new Error("Unsupported color format.");
    }
}

