const canvasContainer = document.getElementById('canvas-container');
const h1 = document.querySelector('h1');
const text1Input = document.getElementById('text1');
const text2Input = document.getElementById('text2');
const tenSelect = document.getElementById('ten');
const text3Input = document.getElementById('text3');
const slider = document.getElementById('slider');
const submitBtn = document.getElementById('submit-btn');
const downloadBtn = document.getElementById('download-btn');
const nightcord = document.getElementById('nightcord');
const copyright = document.getElementById('copyright');
const watermarkCheck = document.getElementById('watermark');
const transparentCheck = document.getElementById('transparent');
const transparentText = document.getElementById('transparent-text');
const colorPicker = document.getElementById('color-picker');
const fontSelector = document.querySelectorAll('input[type="radio"][name="kanji-font"]');
const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');
let firstTime = true;
let currentFont = 'kanji';

text1Input.addEventListener('focus', () => {
    text1Input.previousValue = text1Input.value;
});
text1Input.addEventListener('keydown', () => {
    text1Input.previousValue = text1Input.value;
});
text1Input.addEventListener('input', () => {
    text1Input.value = text1Input.value.replace(/^0+/, '');
    if (text1Input.value === '') {
        text1Input.value = '0';
    }
    if (!text1Input.validity.valid) {
        text1Input.value = text1Input.previousValue;
    }
});

const nightcordEvent = () => {
    if (copyright.style.maxHeight == '0px') {
        copyright.style.maxHeight = copyright.scrollHeight + 'px';
    } else {
        copyright.style.maxHeight = '0px';
    }
};

transparentCheck.addEventListener('change', () => {
    if (transparentCheck.checked) {
        transparentText.dataset.i18n = 'transparent-background';
        transparentText.textContent = i18n.getText('transparent-background');
        colorPicker.style.visibility = 'hidden';
    } else {
        transparentText.dataset.i18n = 'background-color';
        transparentText.textContent = i18n.getText('background-color');
        colorPicker.style.visibility = 'visible';
    }
});

fontSelector.forEach((radio) => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            if (radio.value === 'min') {
                h1.style.fontFamily = 'figure,kana,kanji';
                currentFont = 'kanji';
            } else if (radio.value === 'kai') {
                h1.style.fontFamily = 'figure,kana,kai,kanji';
                currentFont = 'kai, kanji';
            }
        }
    });
});

overlay.addEventListener('click', (e) => {
    const closeButton = document.getElementById('close-btn');
    if (e.target === overlay || e.target === closeButton) {
        overlay.style.display = 'none';
    }
});

const createTextElement = (text, x, y, fontSize, fontFamily, fill, fontWeight = 'normal') => {
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('font-size', fontSize);
    textElement.setAttribute('font-family', fontFamily);
    textElement.setAttribute('font-weight', fontWeight);
    textElement.setAttribute('fill', fill);
    textElement.textContent = text;
    return textElement;
};

const drawChar = (g, char, charX, charY, fontSize, fontFamily, fill, fontWeight = 'normal') => {
    const textElement = createTextElement(char, charX, charY, fontSize, fontFamily, fill, fontWeight);
    g.appendChild(textElement);
    
    return textElement;
}

const drawGradientChar = (g, char, charX, charY, fontSize, fontFamily, fontWeight = 'normal') => {
    return drawChar(g, char, charX, charY, fontSize, fontFamily, 'url(#gradient)', fontWeight);
};

const getKerning = (font, char1, char2, size = 0) => {
    const glyph1 = font.charToGlyph(char1);
    const glyph2 = font.charToGlyph(char2);
    if (!glyph1 || !glyph2) {
        return 0;
    }
    const kerning = font.getKerningValue(glyph1, glyph2);
    if (size > 0) {
        const unitsPerEm = font.unitsPerEm;
        return (kerning * size) / unitsPerEm;
    } else {
        return kerning;
    }
};

const drawHikari = (g, fill, startX, startY, size = false) => {
    let endX, endY, ctrlX, ctrlY;
    if (size) {
        endX = startX + 96;
        endY = startY + 110;
        ctrlX = startX + 53;
        ctrlY = startY + 49;
    } else {
        endX = startX - 171;
        endY = startY + 294;
        ctrlX = startX - 88;
        ctrlY = startY + 130;
    }

    const strokePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    strokePath.setAttribute('d', `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY} Q ${startX + endX - ctrlX} ${startY + endY - ctrlY} ${startX} ${startY}`);
    strokePath.setAttribute('fill', 'black');
    strokePath.setAttribute('stroke', 'black');
    strokePath.setAttribute('stroke-width', '16');
    eraseMask.appendChild(strokePath);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY} Q ${startX + endX - ctrlX} ${startY + endY - ctrlY} ${startX} ${startY}`);
    path.setAttribute('fill', fill);
    g.appendChild(path);
};

const drawTriangle = (g, fill, x1, y1, x2, y2, x3, y3) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${x1},${y1} L${x2},${y2} L${x3},${y3} Z`);
    path.setAttribute('fill', fill);
    g.appendChild(path);
};

const drawSet = (paths) => {
    paths.forEach(([func, ...args]) => {
        func(...args);
    });
};

window.onload = () => {
    fetch('kana.woff')
        .then((res) => res.arrayBuffer())
        .then((data) => {
            const kanaFont = opentype.parse(data);
            fetch('figure.woff')
                .then((res) => res.arrayBuffer())
                .then((data) => {
                    const figureFont = opentype.parse(data);
                    submitBtn.removeAttribute('disabled');

                    const generateLogo = (text1, text2, ten, text3, hikari2X = false) => {
                        slider.setAttribute('text1', text1);
                        slider.setAttribute('text2', text2);
                        slider.setAttribute('ten', ten);
                        slider.setAttribute('text3', text3);

                        canvasContainer.innerHTML = '';
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('width', '2000');
                        svg.setAttribute('height', '366');
                        canvasContainer.appendChild(svg);

                        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                        svg.appendChild(defs);
                    
                        const eraseMask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
                        defs.appendChild(eraseMask);
                        eraseMask.setAttribute('id', 'eraseMask');
                        const maskRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        maskRect.setAttribute('x', '0');
                        maskRect.setAttribute('y', '0');
                        maskRect.setAttribute('width', '100%');
                        maskRect.setAttribute('height', '100%');
                        maskRect.setAttribute('fill', 'white');
                        eraseMask.appendChild(maskRect);

                        if (!transparentCheck.checked) {
                            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            bgRect.setAttribute('x', '0');
                            bgRect.setAttribute('y', '0');
                            bgRect.setAttribute('width', '100%');
                            bgRect.setAttribute('height', '100%');
                            bgRect.setAttribute('fill', colorPicker.value);
                            svg.appendChild(bgRect);
                        }

                        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                        gradient.setAttribute('id', 'gradient');
                        gradient.setAttribute('x1', '100%');
                        gradient.setAttribute('y1', '0%');
                        gradient.setAttribute('x2', '0%');
                        gradient.setAttribute('y2', '100%');
                        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                        stop1.setAttribute('offset', '66%');
                        stop1.setAttribute('stop-color', '#232838');
                        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                        stop2.setAttribute('offset', '100%');
                        stop2.setAttribute('stop-color', '#a6a1d1');
                        gradient.appendChild(stop1);
                        gradient.appendChild(stop2);
                        defs.appendChild(gradient);

                        const hikariGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                        hikariGradient.setAttribute('id', 'hikari-gradient');
                        hikariGradient.setAttribute('x1', '100%');
                        hikariGradient.setAttribute('y1', '0%');
                        hikariGradient.setAttribute('x2', '0%');
                        hikariGradient.setAttribute('y2', '100%');
                        const hikariGradientReversed = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                        hikariGradientReversed.setAttribute('id', 'hikari-gradient-reversed');
                        hikariGradientReversed.setAttribute('x1', '0%');
                        hikariGradientReversed.setAttribute('y1', '0%');
                        hikariGradientReversed.setAttribute('x2', '100%');
                        hikariGradientReversed.setAttribute('y2', '100%');
                        const hikariStops = [
                            { offset: '6%', color: '#597cf7' },
                            { offset: '20%', color: '#bfb6f7' },
                            { offset: '30%', color: '#94b9ef' },
                            { offset: '37%', color: '#a8e8fe' },
                            { offset: '45%', color: '#dcf3cd' },
                            { offset: '53%', color: '#c4bcf8' },
                            { offset: '65%', color: '#6e8df7' },
                            { offset: '75%', color: '#b2bdfb' },
                            { offset: '82%', color: '#c6f0f7' },
                            { offset: '86%', color: '#9aa0d3' },
                            { offset: '91%', color: '#2c4184' }
                        ];
                        hikariStops.forEach(({ offset, color }) => {
                            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                            stop.setAttribute('offset', offset);
                            stop.setAttribute('stop-color', color);
                            hikariGradient.appendChild(stop);
                        });
                        defs.appendChild(hikariGradient);
                        hikariStops.forEach(({ offset, color }) => {
                            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                            stop.setAttribute('offset', offset);
                            stop.setAttribute('stop-color', color);
                            hikariGradientReversed.appendChild(stop);
                        });
                        defs.appendChild(hikariGradientReversed);

                        const triangleGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                        triangleGradient.setAttribute('id', 'triangle-gradient');
                        triangleGradient.setAttribute('x1', '100%');
                        triangleGradient.setAttribute('y1', '0%');
                        triangleGradient.setAttribute('x2', '0%');
                        triangleGradient.setAttribute('y2', '100%');
                        const triangleStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                        triangleStop1.setAttribute('offset', '0%');
                        triangleStop1.setAttribute('stop-color', '#2b2e44');
                        const triangleStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                        triangleStop2.setAttribute('offset', '100%');
                        triangleStop2.setAttribute('stop-color', '#555');
                        triangleGradient.appendChild(triangleStop1);
                        triangleGradient.appendChild(triangleStop2);
                        defs.appendChild(triangleGradient);

                        // Start drawing
                        const gText1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        gText1.setAttribute('id', 'text1');
                        gText1.setAttribute('mask', 'url(#eraseMask)');
                        svg.appendChild(gText1);
                        text1 = text1.slice(0, -1).replace(/\d/g, (digit) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[digit]) + text1.slice(-1);
                        let textX = 44;
                        for (let i = 0; i < text1.length; i++) {
                            const textY = 208;
                            const char = text1[i];
                            const textElement = drawGradientChar(gText1, char, textX, textY, '255px', 'figure');
                            const bbox = textElement.getBBox();
                            textX = bbox.x + bbox.width;
                            if (i < text1.length - 1) {
                                const kerning = getKerning(figureFont, text1[i], text1[i + 1], 255);
                                textX += kerning;
                            }
                        }
                        const hikari1X = textX + 76.58;

                        textX = hikari1X - 77;
                        let textY = 230;
                        let tenX = textX;
                        let tenY = textY;
                        const gText2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        gText2.setAttribute('id', 'text2');
                        gText2.setAttribute('mask', 'url(#eraseMask)');
                        svg.appendChild(gText2);
                        let fontSize = '90px';
                        let fontFamily = `kana, ${currentFont}, serif`;
                        for (let [i, char] of [...text2].entries()) {
                            drawGradientChar(gText2, char, textX, textY, fontSize, fontFamily);
                            tenX = textX;
                            tenY = textY;
                            switch (i) {
                                case 0:
                                    textX += 88;
                                    textY -= 30;
                                    break;
                                case 1:
                                    textX -= 23;
                                    textY += 88;
                                    tenX -= 23;
                                    tenY += 23;
                                    break;
                                default:
                                    break;
                            }
                        }
                        tenX += 78;
                        tenY += 6;
                        drawChar(svg, ten, tenX, tenY, '86px', 'kana', '#000');
                        textX = tenX + 54;

                        const gText3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        gText3.setAttribute('id', 'text3');
                        gText3.setAttribute('mask', 'url(#eraseMask)');
                        svg.appendChild(gText3);
                        fontSize = '99px';
                        fontFamily = `kana, ${currentFont}, serif`;
                        textY = 240;
                        let rdIndex = [text3.length - 1];
                        if (text3.indexOf('cord') != -1) {
                            rdIndex.push(text3.indexOf('cord') + 2);
                            rdIndex.push(text3.indexOf('cord') + 3);
                        }
                        text3 = text3.replace(/gg/g, '󰁧g');
                        for (let [i, char] of [...text3].entries()) {
                            if (char == ' ') {
                                textX += 49.5;
                                continue;
                            }
                            let textElement = null;
                            if (i == 0) {
                                let newChar = String.fromCharCode(char.charCodeAt(0) + 0xb000);
                                if (char.charCodeAt(0) + 0xb000 >= 0xe000 && char.charCodeAt(0) + 0xb000 <= 0xf8ff && kanaFont.charToGlyph(newChar).unicode && text2.length < 3) {
                                    char = newChar;
                                } else {
                                    textX -= 16;
                                }
                                textElement = drawGradientChar(gText3, char, textX, textY, fontSize, fontFamily);
                            } else if (rdIndex.includes(i)) {
                                textElement = drawGradientChar(gText3, char, textX, textY, fontSize, fontFamily);
                            } else {
                                textElement = drawChar(gText3, char, textX, textY, fontSize, fontFamily, '#000');
                            }
                            const bbox = textElement.getBBox();
                            textX = bbox.x + bbox.width;
                            if (i < text3.length - 1) {
                                const kerning = getKerning(kanaFont, text3[i], text3[i + 1], 99);
                                textX += kerning;
                            }
                        }
                        drawGradientChar(gText3, '。', textX - 9, textY, '90px', 'kana', 'bold');

                        const gHikari = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        gHikari.setAttribute('id', 'hikari');
                        svg.appendChild(gHikari);
                        const gHikari1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        gHikari1.setAttribute('id', 'hikari1');
                        gHikari.appendChild(gHikari1);
                        const gHikari1Triangle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        gHikari1Triangle.setAttribute('id', 'hikari1-triangle');
                        gHikari1.appendChild(gHikari1Triangle);

                        drawSet([
                            [drawHikari, gHikari1, 'url(#hikari-gradient)', hikari1X, 40],
                            [drawTriangle, gHikari1Triangle, 'url(#triangle-gradient)', hikari1X - 31, 120, hikari1X - 23, 106, hikari1X - 18, 113],
                            [drawTriangle, gHikari1Triangle, 'url(#triangle-gradient)', hikari1X - 138, 252, hikari1X - 150, 252, hikari1X - 147, 258],
                            [drawTriangle, gHikari1Triangle, 'url(#triangle-gradient)', hikari1X - 99, 233, hikari1X - 113, 263, hikari1X - 97, 265],
                            [drawTriangle, gHikari1Triangle, 'url(#triangle-gradient)', hikari1X - 93, 224, hikari1X - 87, 223, hikari1X - 89, 235]
                        ]);

                        const gHikari2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        gHikari2.setAttribute('id', 'hikari2');
                        gHikari.appendChild(gHikari2);
                        const gHikari2Triangle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        gHikari2Triangle.setAttribute('id', 'hikari2-triangle');
                        gHikari2.appendChild(gHikari2Triangle);

                        const sliderMax = Math.round(textX + 33);
                        const sliderMin = Math.min(sliderMax, Math.round(tenX + 180));
                        const sliderValue = Math.max(sliderMin, Math.min(sliderMax, Math.round(textX - 0.18 * (textX - tenX))));
                        slider.setAttribute('min', sliderMin);
                        slider.setAttribute('max', sliderMax);
                        slider.setAttribute('value', sliderValue);
                        slider.removeAttribute('disabled');

                        if (!hikari2X) {
                            hikari2X = sliderValue;
                        }
                        if (hikari2X < sliderMin) {
                            hikari2X = sliderMin;
                        }
                        if (hikari2X > sliderMax) {
                            hikari2X = sliderMax;
                        }
                        drawSet([
                            [drawHikari, gHikari2, 'url(#hikari-gradient-reversed)', hikari2X - 150, 156, 1],
                            [drawHikari, gHikari2, 'url(#hikari-gradient)', hikari2X, 35],
                            [drawTriangle, gHikari2Triangle, 'url(#triangle-gradient)', hikari2X - 139, 153, hikari2X - 145, 143, hikari2X - 138, 141],
                            [drawTriangle, gHikari2Triangle, 'url(#triangle-gradient)', hikari2X + 9, 131, hikari2X + 23, 117, hikari2X + 28, 126],
                            [drawTriangle, gHikari2Triangle, 'url(#triangle-gradient)', hikari2X - 96, 249, hikari2X - 107, 255, hikari2X - 91, 270],
                            [drawTriangle, gHikari2Triangle, 'url(#triangle-gradient)', hikari2X - 116, 279, hikari2X - 126, 293, hikari2X - 117, 296]
                        ]);

                        svg.setAttribute('width', textX + 73);
                        
                        downloadBtn.removeAttribute('disabled');
                    };

                    submitBtn.dataset.i18n = 'submit-btn-update';
                    submitBtn.textContent = i18n.getText('submit-btn-update');

                    downloadBtn.addEventListener('click', () => {
                        const svg = canvasContainer.querySelector('svg');
                        if (watermarkCheck.checked) {
                            drawChar(svg, '焰', svg.getAttribute('width') - 205, 15, '17px', 'figure', 'rgba(0, 0, 0, 0.7)');
                        }

                        const serializer = new XMLSerializer();
                        const svgString = serializer.serializeToString(svg);
                        let session = new SvgTextToPath(svgString, {
                            useFontFace: true,
                        });
                        session.replaceAll().then(() => {
                            const svgString = session.getSvgString();
                            const blob = new Blob([svgString], { type: 'image/svg+xml' });
                            const url = URL.createObjectURL(blob);
                            const img = new Image();
                            img.src = url;
                            popup.innerHTML = '<span id="close-btn">×</span>';
                            popup.appendChild(img);
                            overlay.style.display = 'flex';
                        });
                    });

                    nightcord.style.cursor = 'pointer';
                    nightcord.addEventListener('click', nightcordEvent);

                    const submit = () => {
                        const text1 = text1Input.value;
                        const text2 = text2Input.value;
                        const ten = tenSelect.value;
                        const text3 = text3Input.value;
                        generateLogo(text1, text2, ten, text3, parseInt(slider.value));
                        if (firstTime) {
                            firstTime = false;
                            watermarkCheck.addEventListener('change', submit);
                            transparentCheck.addEventListener('change', submit);
                            colorPicker.addEventListener('input', submit);
                        }
                    };

                    submitBtn.addEventListener('click', submit);

                    slider.addEventListener('input', () => {
                        generateLogo(slider.getAttribute('text1'), slider.getAttribute('text2'), slider.getAttribute('ten'), slider.getAttribute('text3'), parseInt(slider.value));
                    });
                });
        });
};
