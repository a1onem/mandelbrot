const canvas = document.querySelector('canvas');
const link = document.querySelector('a');
const ctx = canvas.getContext('2d');

let cw = canvas.width = 720; //720
let ch = canvas.height = 405; //405

let imageData = ctx.createImageData(cw, ch);
let buf = new ArrayBuffer(imageData.data.length);
let buf8 = new Uint8ClampedArray(buf);
let data = new Uint32Array(buf);

let cw2 = cw / 2;
let ch2 = ch / 2;

let startX = startY = currentX = currentY = 0;

let step = 1; //iteration step
let auto = true;
let click = false;
let k = 1;
let g = 15;
let time_before = Date.now();
let number = { real: -1.834566468554715, imag: 0 };

let zoom_min = zoom = cw / 8;
let div = 1;

let v = {
    width: cw,
    height: ch,
    iter: 32,
    real: '',
    imag: '',
    fps: '',
    zoom: '',
    blue: 255,
    green: 103,
    red: 114,
    rep: 5,

    reset: () => {
        auto = false, number.real = 0, number.imag = 0, v.iter = 32, zoom = zoom_min;
    },

    auto: () => {
        auto = !auto;
    },

    fullscr: () => {
        document.webkitFullscreenElement ? document.webkitCancelFullScreen() : document.documentElement.webkitRequestFullscreen();
    },

    export: () => {
        link.href = canvas.toDataURL();
        link.download = 'image.png';
        link.click()
    },
}

function Render() {
    let time_now = Date.now();
    v.fps = Math.round(1000 / (time_now - time_before));
    time_before = time_now;

    if (auto) {
        div = 2;
        if (zoom > 1e15) {
            k = -1,
                g = 15.9;
        }
        if (zoom < cw / 8 - 1) {
            k = 1,
                g = 15;
        }
        zoom += zoom / g * k, v.iter += step * k
    }

    drawBrot();

    imageData.data.set(buf8);
    ctx.putImageData(imageData, 0, 0);

    guireal.setValue((number.real).toFixed(15));
    guiimag.setValue((number.imag).toFixed(15));
    guizoom.setValue(Math.floor(zoom));

    if (div > 1) div--;
    requestAnimationFrame(Render);
}

function drawBrot() {
    for (let i = -cw2; i < cw2; i += div) {
        for (let j = -ch2; j < ch2; j += div) {

            m = check(i / zoom + number.real, j / zoom + number.imag);

            for (let g = 0; g < div; g++) {
                for (let l = 0; l < div; l++) {
                    data[(j + g + ch2) * cw + i + l + cw2] = m == 0 ? 0 : 255 << 24 |
                        (v.blue * (m / (v.iter / v.rep))) % 255 << 16 |
                        (v.green * (m / (v.iter / v.rep))) % 255 << 8 |
                        (v.red * (m / (v.iter / v.rep))) % 255;
                }
            }
        }
    }
}

function check(x, y) {
    let z = { x, y }
    for (let i = 0; i < v.iter; ++i) {

        let xx = (z.x * z.x - z.y * z.y) + x;
        let yy = (z.y * z.x + z.x * z.y) + y;

        if (xx * xx + yy * yy > 16) return i;
        z.x = xx;
        z.y = yy;
    }
    return 0;
}

canvas.addEventListener("mousedown", e => {
    startX = e.offsetX, startY = e.offsetY;
    click = true;
});

canvas.addEventListener('mousemove', e => {
    if (click && !auto) {
        div = 4;
        number.real -= ((e.offsetX - startX) / zoom) / 30;
        number.imag -= ((e.offsetY - startY) / zoom) / 30;
    }
});

canvas.addEventListener("mouseup", () => {
    click = false;
});

canvas.addEventListener("mousewheel", e => {
    e.preventDefault();
    if (!auto) {
        if (e.deltaY < 0) {
            div = 4;
            zoom += zoom / 15, v.iter += step;
        } else {
            zoom > cw / 8 ? (zoom -= zoom / 15.9, div = 4) : zoom = zoom_min;
            v.iter > 32 ? v.iter -= step : v.iter = 32;
        }
    }
});

const gui = new dat.GUI({ width: 260 });

gui.add(v, 'reset').name('Reset');
gui.add(v, 'auto').name('Auto On/Off');
gui.add(v, 'fullscr').name('Fullscreen');
gui.add(v, 'export').name('Export Image');

gui.add(v, 'width', 50, window.innerWidth / 2, 1).name('Canvas Width').onFinishChange(value => {
    cw = value;
    prepareCanvas();
});
gui.add(v, 'height', 50, window.innerHeight / 2, 1).name('Canvas Height').onFinishChange(value => {
    ch = value;
    prepareCanvas();
});

gui.add(v, 'fps').name('FPS').listen();

const guireal = gui.add(v, 'real').name('Real Number').
    onFinishChange(value => {
        number.real = parseFloat(value);
    });

const guiimag = gui.add(v, 'imag').name('Imaginary Number').
    onFinishChange(value => {
        number.imag = parseFloat(value);
    });

gui.add(v, 'iter', 20, 2000, 1).name('Iterations').listen();

const guizoom = gui.add(v, 'zoom').name('Zoom').
    onFinishChange(value => {
        zoom = parseInt(value);
    });

gui.add(v, 'red', 0, 255, 1).name('Red channel');
gui.add(v, 'green', 0, 255, 1).name('Green channel');
gui.add(v, 'blue', 0, 255, 1).name('Blue channel');
gui.add(v, 'rep', 1, 10, 1).name('Color repiter');



const prepareCanvas = () => {
    canvas.width = cw;
    canvas.height = ch;

    imageData = ctx.createImageData(cw, ch);
    buf = new ArrayBuffer(imageData.data.length);
    buf8 = new Uint8ClampedArray(buf);
    data = new Uint32Array(buf);

    cw2 = cw / 2;
    ch2 = ch / 2;

    zoom_min = zoom = cw / 8
}

Render();