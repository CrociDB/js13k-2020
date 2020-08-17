var canvas;
var gl;

// Tools

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

class Shader {
    constructor(gl) {
        this.gl = gl;
        this.uniforms = {};
    }

    setShaders(v, f) {
        let gl = this.gl;
        let vsh = createShader(gl, gl.VERTEX_SHADER, v);
        let fsh = createShader(gl, gl.FRAGMENT_SHADER, f);

        this.program = createProgram(gl, vsh, fsh);
        this.uniforms = {};
        this.use();
    }

    use() {
        this.gl.useProgram(this.program);
    }

    u(uniform) {
        if (this.uniforms[uniform] === undefined) {
            this.uniforms[uniform] = this.gl.getUniformLocation(this.program, uniform);
        }

        return this.uniforms[uniform];
    }

    uniform1f(uniform, v) {
        this.gl.uniform1f(this.u(uniform), v);
    }
    
    uniformv(uniform, vec) {
        this.gl.uniform3f(this.u(uniform), vec.x, vec.y, vec.z);
    }
}

function initWebGL()
{
    canvas = document.getElementById("game-canvas");
    gl = canvas.getContext("webgl2");

    let width = canvas.width;
    let height = canvas.height;

    // Getting shaders
    let vertexCode = document.getElementById("svs").text;
    let fragmentCode = document.getElementById("sg").text;

    let shaderCodes = {
        mainVertex: vertexCode,
        gameFragment: fragmentCode
    }

    let shader = new Shader(gl);
    shader.setShaders(vertexCode, fragmentCode);

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let positions = [
        -1, -1, 0, -.5, -.5,
        -1, 1, 0, -.5, .5,
        1, 1, 0, .5, .5,

        1, 1, 0, .5, .5,
        1, -1, 0, .5, -.5,
        -1, -1, 0, -.5, -.5
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    //let input = new Input(canvas);
    //let dialog = new Dialog("dialog");

    let title = document.getElementById("game-title");

    // let stateManager = new StateManager({
    //     gl: gl, 
    //     shader: shader, 
    //     shaderCodes: shaderCodes});
    // stateManager.setState(new MenuState());

    let loop = (timestamp) => {
        // Render
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(0, 
            3, gl.FLOAT, false, 5 * 4, 0);
            
        gl.vertexAttribPointer(1, 
            2, gl.FLOAT, false, 5 * 4, 3 * 4);
                
        shader.use();

        // stateManager.update();
        // stateManager.time = timestamp;
        //input.update(timestamp);
        //dialog.setBlink(input.blink);

        // Default uniform data
        shader.uniform1f("time", timestamp * .001);
        shader.uniform1f("aspectRatio", width / height);

        let primitiveType = gl.TRIANGLES;
        offset = 0;
        let count = 6;
        gl.drawArrays(primitiveType, offset, count);

        window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);
}

function downloadShaders(finishCallback)
{
    let loaded = 0;
    let shaders = [];
    let scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++)
    {
        if (scripts[i].type == "notjs")
        {
            shaders.push(scripts[i]);
        }
    }

    shaders.forEach((s) => {
        let req = new XMLHttpRequest();
        req.addEventListener("load", () => {
            s.innerHTML = req.responseText;
            console.log("Loaded ", s);
            if (++loaded >= shaders.length) {
                finishCallback();
            }
        });
        req.open("GET", s.src);
        req.send();
    });
}

(function() {
    downloadShaders(initWebGL);
 })();
 