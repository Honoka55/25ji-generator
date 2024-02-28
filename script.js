const canvasContainer = document.getElementById('canvas-container');
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
const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');

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
        transparentText.textContent = '透明背景';
        colorPicker.style.visibility = 'hidden';
    } else {
        transparentText.textContent = '背景色：';
        colorPicker.style.visibility = 'visible';
    }
});

overlay.addEventListener('click', (e) => {
    const closeButton = document.getElementById('close-btn');
    if (e.target === overlay || e.target === closeButton) {
        overlay.style.display = 'none';
    }
});

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
                        canvasContainer.innerHTML = '';
                        const canvas = document.createElement('canvas');
                        canvas.width = 2000;
                        canvas.height = 366;
                        canvasContainer.appendChild(canvas);
                        const ctx = canvas.getContext('2d');

                        ctx.lineWidth = 16;
                        let strokeErase;

                        if (transparentCheck.checked) {
                            strokeErase = () => {
                                ctx.globalCompositeOperation = 'destination-out';
                                ctx.stroke();
                                ctx.globalCompositeOperation = 'source-over';
                            };
                        } else {
                            ctx.fillStyle = colorPicker.value;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            strokeErase = () => {
                                ctx.strokeStyle = colorPicker.value;
                                ctx.stroke();
                            };
                        }

                        const drawGradientChar = (char, charX, charY) => {
                            const measure = ctx.measureText(char);
                            const gradient = ctx.createLinearGradient(charX + measure.width, charY - measure.actualBoundingBoxAscent, charX, charY + measure.actualBoundingBoxDescent);
                            gradient.addColorStop(0.66, '#232838');
                            gradient.addColorStop(1, '#a6a1d1');
                            ctx.fillStyle = gradient;
                            ctx.fillText(char, charX, charY);
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

                        const drawHikari = (startX, startY, size = false) => {
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

                            ctx.moveTo(startX, startY);
                            ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
                            ctx.quadraticCurveTo(startX + endX - ctrlX, startY + endY - ctrlY, startX, startY);

                            const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                            gradient.addColorStop(0.06, '#597cf7');
                            gradient.addColorStop(0.2, '#bfb6f7');
                            gradient.addColorStop(0.3, '#94b9ef');
                            gradient.addColorStop(0.37, '#a8e8fe');
                            gradient.addColorStop(0.45, '#dcf3cd');
                            gradient.addColorStop(0.53, '#c4bcf8');
                            gradient.addColorStop(0.65, '#6e8df7');
                            gradient.addColorStop(0.75, '#b2bdfb');
                            gradient.addColorStop(0.82, '#c6f0f7');
                            gradient.addColorStop(0.86, '#9aa0d3');
                            gradient.addColorStop(0.91, '#2c4184');

                            return gradient;
                        };

                        const drawTriangle = (x1, y1, x2, y2, x3, y3) => {
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.lineTo(x3, y3);
                            ctx.lineTo(x1, y1);

                            const gradient = ctx.createLinearGradient(Math.max(x1, x2, x3), Math.min(y1, y2, y3), Math.min(x1, x2, x3), Math.max(y1, y2, y3));
                            gradient.addColorStop(0, '#2b2e44');
                            gradient.addColorStop(1, '#555');
                            return gradient;
                        };

                        const drawSet = (paths) => {
                            ctx.beginPath();
                            for (let i = 0; i < paths.length; i++) {
                                const [func, ...args] = paths[i];
                                func(...args);
                            }
                            ctx.moveTo(paths[0][1], paths[0][2]);
                            ctx.closePath();
                            strokeErase();

                            for (let i = 0; i < paths.length; i++) {
                                const [func, ...args] = paths[i];
                                ctx.beginPath();
                                ctx.fillStyle = func(...args);
                                ctx.closePath();
                                ctx.fill();
                            }
                        };

                        ctx.font = '255px figure';
                        text1 = text1.slice(0, -1).replace(/\d/g, (digit) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[digit]) + text1.slice(-1);
                        let textX = 44;
                        for (let i = 0; i < text1.length; i++) {
                            const textY = 208;
                            const char = text1[i];
                            drawGradientChar(char, textX, textY);
                            textX += ctx.measureText(char).width;
                            if (i < text1.length - 1) {
                                const kerning = getKerning(figureFont, text1[i], text1[i + 1], 255);
                                textX += kerning;
                            }
                        }
                        const hikari1X = textX + 76.58;

                        ctx.fillStyle = '#000';
                        ctx.font = '90px kana, kanji, serif';
                        textX = hikari1X - 77;
                        let textY = 230;
                        let tenX = textX;
                        let tenY = textY;
                        for (let [i, char] of [...text2].entries()) {
                            drawGradientChar(char, textX, textY);
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
                        ctx.font = '86px kana';
                        ctx.fillText(ten, tenX, tenY);
                        textX = tenX + 54;

                        ctx.font = '99px kana, kanji, serif';
                        textY = 240;
                        let rdIndex = [text3.length - 1];
                        if (text3.indexOf('cord') != -1) {
                            rdIndex.push(text3.indexOf('cord') + 2);
                            rdIndex.push(text3.indexOf('cord') + 3);
                        }
                        text3 = text3.replace(/Night/g, 'Ni󰁧ht');
                        for (let [i, char] of [...text3].entries()) {
                            if (i == 0) {
                                let newChar = String.fromCharCode(char.charCodeAt(0) + 0xb000);
                                if (char.charCodeAt(0) + 0xb000 >= 0xe000 && char.charCodeAt(0) + 0xb000 <= 0xf8ff && kanaFont.charToGlyph(newChar).unicode && text2.length < 3) {
                                    char = newChar;
                                } else {
                                    textX -= 16;
                                }
                                drawGradientChar(char, textX, textY);
                            } else if (rdIndex.includes(i)) {
                                drawGradientChar(char, textX, textY);
                            } else {
                                ctx.fillStyle = '#000';
                                ctx.fillText(char, textX, textY);
                            }
                            textX += ctx.measureText(char).width;
                            if (i < text3.length - 1) {
                                const kerning = getKerning(kanaFont, text3[i], text3[i + 1], 99);
                                textX += kerning;
                            }
                        }
                        ctx.font = 'bold 90px kana';
                        drawGradientChar('。', textX - 9, textY);

                        drawSet([
                            [drawHikari, hikari1X, 40],
                            [drawTriangle, hikari1X - 31, 120, hikari1X - 23, 106, hikari1X - 18, 113],
                            [drawTriangle, hikari1X - 138, 252, hikari1X - 150, 252, hikari1X - 147, 258],
                            [drawTriangle, hikari1X - 99, 233, hikari1X - 113, 263, hikari1X - 97, 265],
                            [drawTriangle, hikari1X - 93, 224, hikari1X - 87, 223, hikari1X - 89, 235]
                        ]);

                        const sliderMin = Math.round(tenX + 180);
                        const sliderMax = Math.round(textX + 33);
                        const sliderValue = Math.max(sliderMin, Math.min(sliderMax, Math.round(textX - 0.18 * (textX - tenX))));
                        slider.setAttribute('min', sliderMin);
                        slider.setAttribute('max', sliderMax);
                        slider.setAttribute('value', sliderValue);
                        slider.setAttribute('text1', text1);
                        slider.setAttribute('text2', text2);
                        slider.setAttribute('ten', ten);
                        slider.setAttribute('text3', text3);
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
                            [drawHikari, hikari2X - 150, 156, 1],
                            [drawHikari, hikari2X, 35],
                            [drawTriangle, hikari2X - 139, 153, hikari2X - 145, 143, hikari2X - 138, 141],
                            [drawTriangle, hikari2X + 9, 131, hikari2X + 23, 117, hikari2X + 28, 126],
                            [drawTriangle, hikari2X - 96, 249, hikari2X - 107, 255, hikari2X - 91, 270],
                            [drawTriangle, hikari2X - 116, 279, hikari2X - 126, 293, hikari2X - 117, 296]
                        ]);

                        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        canvas.width = textX + 73;
                        ctx.putImageData(data, 0, 0);

                        submitBtn.textContent = '更新';

                        downloadBtn.removeAttribute('disabled');
                        downloadBtn.addEventListener('click', () => {
                            if (watermarkCheck.checked) {
                                ctx.font = '17px figure';
                                ctx.globalAlpha = 0.7;
                                ctx.fillText('焰', canvas.width - 205, 15);
                                ctx.globalAlpha = 1;
                            }

                            const img = new Image();
                            img.src = canvas.toDataURL('image/png');
                            popup.innerHTML = '<span id="close-btn">×</span>';
                            popup.appendChild(img);
                            overlay.style.display = 'flex';

                            if (transparentCheck.checked) {
                                ctx.clearRect(canvas.width - 205, 0, canvas.width, 20);
                            } else {
                                ctx.fillStyle = colorPicker.value;
                                ctx.fillRect(canvas.width - 205, 0, canvas.width, 20);
                            }
                        });

                        nightcord.style.cursor = 'pointer';
                        nightcord.addEventListener('click', nightcordEvent);
                    };

                    const submit = () => {
                        const text1 = text1Input.value;
                        const text2 = text2Input.value;
                        const ten = tenSelect.value;
                        const text3 = text3Input.value;
                        generateLogo(text1, text2, ten, text3, parseInt(slider.value));
                    };

                    submitBtn.addEventListener('click', submit);
                    watermarkCheck.addEventListener('change', submit);
                    transparentCheck.addEventListener('change', submit);
                    colorPicker.addEventListener('input', submit);

                    slider.addEventListener('input', () => {
                        generateLogo(slider.getAttribute('text1'), slider.getAttribute('text2'), slider.getAttribute('ten'), slider.getAttribute('text3'), parseInt(slider.value));
                    });
                });
        });
};
