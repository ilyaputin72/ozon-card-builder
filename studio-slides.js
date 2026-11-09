'use strict';

const studioSlides = (() => {
  const width = 900;
  const height = 1200;
  const themes = {
    mint: { paper: '#a9ca60', light: '#fff5da', dark: '#294420', accent: '#ff761d', ink: '#2d371e', line: '#dae889' },
    blue: { paper: '#9cd7ee', light: '#fff6e4', dark: '#1c4766', accent: '#ff9862', ink: '#213d54', line: '#c8eff8' },
    sand: { paper: '#ffda6b', light: '#fff5e8', dark: '#631b39', accent: '#ed5482', ink: '#532a32', line: '#ffeaa4' }
  };
  function font(context, size, weight = 700) {
    context.font = weight + ' ' + size + 'px system-ui, sans-serif';
  }

  function wrapText(context, text, maxWidth) {
    const output = [];
    let line = '';
    for (const word of text.trim().split(/\s+/)) {
      const candidate = line ? line + ' ' + word : word;
      if (context.measureText(candidate).width <= maxWidth) { line = candidate; continue; }
      if (line) output.push(line);
      line = '';
      for (const character of word) {
        if (line && context.measureText(line + character).width > maxWidth) { output.push(line); line = ''; }
        line += character;
      }
    }
    if (line) output.push(line);
    return output;
  }

  function drawText(context, text, x, y, maxWidth, { size, min = size, count = 1, color, weight = 700 }) {
    let rows;
    let fitted = size;
    for (; fitted >= min; fitted -= 1) {
      font(context, fitted, weight);
      rows = wrapText(context, text, maxWidth);
      if (rows.length <= count || fitted === min) break;
    }
    if (rows.length > count) {
      rows = rows.slice(0, count);
      let tail = rows.at(-1);
      while (tail && context.measureText(tail + '…').width > maxWidth) tail = tail.slice(0, -1);
      rows[count - 1] = tail.trimEnd() + '…';
    }
    context.fillStyle = color;
    context.textBaseline = 'top';
    rows.forEach((row, index) => context.fillText(row, x, y + index * Math.round(fitted * 1.15)));
  }

  function shape(context, x, y, w, h, radius, fill) {
    context.fillStyle = fill;
    context.beginPath();
    context.roundRect(x, y, w, h, radius);
    context.fill();
  }

  function contain(context, image, x, y, w, h) {
    const scale = Math.min(w / image.naturalWidth, h / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(image, x + (w - drawWidth) / 2, y + (h - drawHeight) / 2, drawWidth, drawHeight);
  }

  function background(canvas, fill) {
    // Reset the drawing surface as well as its export permissions.
    canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = fill;
    context.fillRect(0, 0, width, height);
    return context;
  }

  function spark(context, x, y, size, fill) {
    context.fillStyle = fill;
    context.beginPath();
    context.moveTo(x, y - size);
    context.quadraticCurveTo(x + size * .14, y - size * .14, x + size, y);
    context.quadraticCurveTo(x + size * .14, y + size * .14, x, y + size);
    context.quadraticCurveTo(x - size * .14, y + size * .14, x - size, y);
    context.quadraticCurveTo(x - size * .14, y - size * .14, x, y - size);
    context.fill();
  }

  function backdrop(context, colors) {
    context.fillStyle = colors.accent;
    context.beginPath();
    context.ellipse(455, 688, 432, 287, -.18, 0, 2 * Math.PI);
    context.fill();
    spark(context, 97, 433, 28, colors.light);
    spark(context, 807, 387, 36, colors.accent);
    spark(context, 798, 876, 40, colors.light);
    spark(context, 87, 967, 23, colors.dark);
  }

  function render(canvases, { source, image, name, points, theme, format }) {
    const colors = Object.hasOwn(themes, theme) ? themes[theme] : themes.mint;
    const cover = background(canvases.cover, colors.paper);
    if (format === 'plain') {
      cover.fillStyle = '#fff';
      cover.fillRect(0, 0, width, height);
      contain(cover, image, 0, 0, width, height);
    } else {
      backdrop(cover, colors);
      shape(cover, 54, 47, 360, 49, 25, colors.light);
      drawText(cover, (source.brand || source.category).toUpperCase(), 72, 58, 326, { size: 26, min: 15, color: colors.dark, weight: 850 });
      drawText(cover, name, 53, 118, 794, { size: 96, min: 49, count: 3, color: colors.dark, weight: 900 });
      spark(cover, 790, 85, 31, colors.light);
      contain(cover, image, 30, 390, 840, 648);
      const value = source.facts[0][1];
      shape(cover, 53, 1050, 794, 99, 32, colors.light);
      drawText(cover, source.facts[0][0] + '  ·  ' + value, 80, 1073, 740, { size: 45, min: 23, color: colors.dark, weight: 850 });
    }

    const highlight = background(canvases.highlights, colors.accent);
    shape(highlight, 54, 48, 237, 46, 23, colors.light);
    drawText(highlight, '02  /  О ТОВАРЕ', 74, 59, 193, { size: 24, color: colors.dark, weight: 850 });
    drawText(highlight, points.length ? 'Главные особенности' : source.kind, 54, 111, 793, { size: 81, min: 48, count: 2, color: colors.dark, weight: 900 });
    highlight.fillStyle = colors.paper;
    highlight.beginPath();
    highlight.ellipse(448, 488, 345, 193, -.13, 0, 2 * Math.PI);
    highlight.fill();
    spark(highlight, 95, 363, 30, colors.light);
    spark(highlight, 812, 575, 34, colors.light);
    contain(highlight, image, 130, 295, 640, 375);
    points.forEach((point, index) => {
      const y = 710 + index * 144;
      shape(highlight, 58, y, 784, 123, 35, colors.light);
      shape(highlight, 78, y + 24, 69, 69, 35, colors.paper);
      drawText(highlight, '0' + (index + 1), 93, y + 40, 52, { size: 28, color: colors.accent, weight: 800 });
      drawText(highlight, point, 169, y + 24, 641, { size: 40, min: 25, count: 2, color: colors.ink });
    });

    const specs = background(canvases.specifications, colors.paper);
    shape(specs, 44, 45, 812, 213, 36, colors.accent);
    shape(specs, 70, 65, 251, 48, 24, colors.light);
    drawText(specs, '03  /  ПАРАМЕТРЫ', 88, 76, 219, { size: 24, color: colors.dark, weight: 850 });
    drawText(specs, 'Характеристики', 70, 130, 760, { size: 79, min: 46, color: colors.dark, weight: 900 });
    if (source.facts.length <= 5) {
      spark(specs, 126, 1018, 34, colors.light);
      spark(specs, 771, 921, 28, colors.accent);
      contain(specs, image, 235, 823, 430, 340);
    }
    source.facts.forEach(([key, value], index) => {
      const y = 280 + index * 107;
      shape(specs, 45, y, 810, 95, 25, index % 2 === 0 ? colors.light : colors.line);
      drawText(specs, key, 68, y + 16, 316, { size: 34, min: 20, count: 2, color: colors.dark, weight: 700 });
      drawText(specs, value, 407, y + 16, 425, { size: 38, min: 20, count: 2, color: colors.ink });
    });
  }

  return { render };
})();
