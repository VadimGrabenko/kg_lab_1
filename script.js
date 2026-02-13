window.onload = function () {
    const canvas = document.getElementById("glcanvas");
    const gl = setupWebGL(canvas);
    if (!gl) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.20, 0.30, 0.50, 1.0);

    const vsSource = `
    attribute vec2 aPosition;
    attribute vec3 aColor;

    varying vec3 vColor;

    uniform float uAngle;
    uniform vec2 uOffset;

    void main() {
      float c = cos(uAngle);
      float s = sin(uAngle);

      // rotation around origin (0,0)
      vec2 rotated = vec2(
        aPosition.x * c - aPosition.y * s,
        aPosition.x * s + aPosition.y * c
      );

      rotated += uOffset;

      gl_Position = vec4(rotated, 0.0, 1.0);
      vColor = aColor;
    }
  `;

    const fsSource = `
    precision mediump float;
    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

    const program = createProgram(gl, vsSource, fsSource);
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aColor = gl.getAttribLocation(program, "aColor");
    const uAngle = gl.getUniformLocation(program, "uAngle");
    const uOffset = gl.getUniformLocation(program, "uOffset");


    const triangleData = new Float32Array([
        0.0,  0.55,  1.0, 0.0, 0.0,
        -0.55, -0.45, 0.0, 1.0, 0.0,
        0.55, -0.45, 0.0, 0.0, 1.0,
    ]);

    const squareData = new Float32Array([
        -0.32,  0.32,  1.0, 0.0, 0.0,
        -0.32, -0.32,  0.0, 1.0, 0.0,
        0.32, -0.32,  0.0, 0.0, 1.0,

        -0.32,  0.32,  1.0, 0.0, 0.0,
        0.32, -0.32,  0.0, 0.0, 1.0,
        0.32,  0.32,  1.0, 1.0, 0.0,
    ]);

    const fanData = new Float32Array([
        0.0,  0.0,  1.0, 1.0, 1.0,

        -0.22,  0.20,  1.0, 0.0, 0.0,
        0.22,  0.22,  0.0, 1.0, 0.0,
        0.33,  0.00,  0.0, 0.0, 1.0,
        0.00, -0.35,  1.0, 1.0, 0.0,
        -0.33,  0.00,  0.0, 1.0, 1.0,
        -0.22,  0.20,  1.0, 0.0, 0.0,
    ]);

    const triBuffer = createBuffer(gl, triangleData);
    const squareBuffer = createBuffer(gl, squareData);
    const fanBuffer = createBuffer(gl, fanData);

    function bindAttributes() {
        const stride = 5 * 4;
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(aPosition);

        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 2 * 4);
        gl.enableVertexAttribArray(aColor);
    }

    let angle = 0.0;

    let fanY = 0.0;
    let dir = 1;

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, triBuffer);
        bindAttributes();
        gl.uniform1f(uAngle, 0.0);
        gl.uniform2f(uOffset, 0.0, 0.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
        bindAttributes();
        gl.uniform1f(uAngle, angle);
        gl.uniform2f(uOffset, 0.0, 0.0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        angle += 0.01;

        gl.bindBuffer(gl.ARRAY_BUFFER, fanBuffer);
        bindAttributes();
        gl.uniform1f(uAngle, 0.0);
        gl.uniform2f(uOffset, 0.0, fanY);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 7);

        fanY += 0.01 * dir;
        if (fanY > 0.55 || fanY < -0.55) dir *= -1;

        requestAnimationFrame(render);
    }

    render();
};

function setupWebGL(canvas) {
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert("WebGL не підтримується у вашому браузері.");
        return null;
    }
    return gl;
}

function createShader(gl, type, source) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);

    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
    }
    return sh;
}

function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function createBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}
