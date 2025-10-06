// 全局变量
let scene, camera, renderer, controls;
let sphere, sphereMaterial; // 添加球体和材质的全局引用
let currentTextureIndex = 1; // 当前纹理索引

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // 创建相机
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.getElementById('container').appendChild(renderer.domElement);

    // 创建控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 添加光照
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 加载纹理
    const textureLoader = new THREE.TextureLoader();

    // const images = [
    //     './texture/back.png',
    //     './texture/down.png',
    //     './texture/front.png',
    //     './texture/left.png',
    //     './texture/right.png',
    //     './texture/up.png'
    // ];
    // let materials = [];
    // images.forEach(imgurl => {
    //     const texture = textureLoader.load(imgurl); // 加载纹理
    //     const material = new THREE.MeshBasicMaterial({ map: texture });
    //     materials.push(material);
    // });

    // // 添加一个带纹理的立方体作为示例 
    // const cube = new THREE.Mesh(
    //     new THREE.BoxGeometry(10, 10, 10), 
    //     materials
    // );
    // cube.geometry.scale(12, 12, -12);
    // cube.castShadow = true;
    // scene.add(cube);

    // // 添加地面
    // const groundGeometry = new THREE.PlaneGeometry(10, 10);
    // const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    // ground.rotation.x = -Math.PI / 2;
    // ground.receiveShadow = true;
    // //scene.add(ground);
    const texture = textureLoader.load('./src/livingroom_1-2.png');
    const sphereGeometry = new THREE.SphereGeometry(10, 20, 20);
    sphereMaterial = new THREE.MeshBasicMaterial({
         map: texture
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.geometry.scale(20, 20, -20);
    sphere.castShadow = true;
    scene.add(sphere);

    // 添加事件监听
    window.addEventListener('resize', onWindowResize);

    // 开始渲染循环
    animate();
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Texture Configuration
const textureConfigs = {
    1: {
        name: 'Living Room 1',
        file: 'livingroom_1-2.png',
        path: './src/livingroom_1-2.png',
        customTexture: null // Store custom uploaded texture
    },
    2: {
        name: 'Living Room 2',
        file: 'livingroom_2-2.png',
        path: './src/livingroom_2-2.png',
        customTexture: null // Store custom uploaded texture
    }
};

// Switch Texture
function switchTexture(textureIndex) {
    const config = textureConfigs[textureIndex];
    if (!config) return;

    console.log(`Switching to texture: ${config.name}`);
    
    // Check if there's a custom uploaded texture
    if (config.customTexture) {
        // Use custom texture
        sphereMaterial.map = config.customTexture;
        sphereMaterial.needsUpdate = true;
        updateUI(textureIndex);
        console.log(`Custom texture loaded successfully: ${config.name}`);
    } else {
        // Load default texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(config.path, (texture) => {
            // Update sphere material
            sphereMaterial.map = texture;
            sphereMaterial.needsUpdate = true;
            
            // Update UI
            updateUI(textureIndex);
            
            console.log(`Texture loaded successfully: ${config.name}`);
        }, undefined, (error) => {
            console.error('Texture loading failed:', error);
            alert(`Texture loading failed: ${config.name}`);
        });
    }
}

// Update UI Display
function updateUI(textureIndex) {
    const config = textureConfigs[textureIndex];
    
    // Update button status
    document.querySelectorAll('.texture-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`texture${textureIndex}Btn`).classList.add('active');
    
    // Update information display (if elements exist)
    const currentTextureEl = document.getElementById('currentTexture');
    const currentFileEl = document.getElementById('currentFile');
    if (currentTextureEl) currentTextureEl.textContent = config.name;
    if (currentFileEl) currentFileEl.textContent = config.file;
}

// Handle Image Upload
function handleImageUpload(file, textureIndex) {
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file!');
        return;
    }
    
    // Create FileReader to read the image
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const textureLoader = new THREE.TextureLoader();
        
        // Load the uploaded image as texture
        textureLoader.load(e.target.result, (texture) => {
            // Store the custom texture
            textureConfigs[textureIndex].customTexture = texture;
            
            // If this texture is currently active, apply it immediately
            if (currentTextureIndex === textureIndex) {
                sphereMaterial.map = texture;
                sphereMaterial.needsUpdate = true;
            }
            
            console.log(`Custom image uploaded for texture ${textureIndex}`);
            
            // Visual feedback
            const btn = document.getElementById(`texture${textureIndex}Btn`);
            btn.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                btn.style.animation = '';
            }, 500);
        }, undefined, (error) => {
            console.error('Failed to load uploaded image:', error);
            alert('Failed to load the uploaded image. Please try another file.');
        });
    };
    
    reader.onerror = () => {
        alert('Failed to read the image file. Please try again.');
    };
    
    // Read the file as data URL
    reader.readAsDataURL(file);
}

// Setup Texture Switch Controls
function setupTextureControls() {
    const texture1Btn = document.getElementById('texture1Btn');
    const texture2Btn = document.getElementById('texture2Btn');
    const preDesignUpload = document.getElementById('preDesignUpload');
    const postDesignUpload = document.getElementById('postDesignUpload');

    // Texture switch buttons
    texture1Btn.addEventListener('click', () => {
        if (currentTextureIndex !== 1) {
            currentTextureIndex = 1;
            switchTexture(1);
        }
    });

    texture2Btn.addEventListener('click', () => {
        if (currentTextureIndex !== 2) {
            currentTextureIndex = 2;
            switchTexture(2);
        }
    });
    
    // Image upload handlers
    preDesignUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file, 1);
            // Reset input to allow uploading the same file again
            e.target.value = '';
        }
    });
    
    postDesignUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file, 2);
            // Reset input to allow uploading the same file again
            e.target.value = '';
        }
    });
}

// Navigation Panel Function
function setupChatBot() {
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');
    const floatingButton = document.getElementById('floatingChatButton');
    
    // Navigation buttons
    const homeBtn = document.getElementById('homeBtn');
    const textureBtn = document.getElementById('textureBtn');
    const aiBtn = document.getElementById('aiBtn');
    const menuBtn = document.getElementById('menuBtn');

    // AI Response Database
    const aiResponses = {
        'hello': 'Hello! Welcome to Instant Interior! I can help you understand the various features of this interior design platform.',
        'how to use': 'It\'s simple: 1. Mouse drag to rotate view 2. Scroll wheel to zoom 3. Click right buttons to switch textures 4. Experience 360° immersive browsing',
        'texture switch': 'Click the "Living Room 1" and "Living Room 2" buttons in the top right to switch between different interior scene textures in real-time, allowing you to quickly compare different design solutions.',
        'interaction control': 'You can use mouse drag to rotate the view, scroll wheel to zoom the scene, and experience 360° immersive browsing effects.',
        'technology': 'This platform is built on WebGL and Three.js technology, supporting real-time rendering of high-resolution textures for smooth 3D experience.',
        'design': 'Instant Interior allows you to quickly preview and compare different interior design solutions, providing intuitive visual references for your space design.',
        'help': 'I can answer questions about platform usage, technical features, design functions, etc. Please tell me what you\'d like to know!',
        'features': 'Main features include: 360° scene browsing, real-time texture switching, high-resolution rendering, immersive experience, etc.',
        'platform': 'Instant Interior is a professional interior design preview platform that helps designers and users quickly experience different space design solutions.'
    };

    // Send Message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Simulate AI response delay
        setTimeout(() => {
            hideTypingIndicator();
            const response = getAIResponse(message);
            addMessage(response, 'ai');
        }, 1000 + Math.random() * 1000);
    }

    // Add message to chat window
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = 'AI is thinking<span class="typing-dots"><span></span><span></span><span></span></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Get AI Response
    function getAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Keyword matching
        for (const [keyword, response] of Object.entries(aiResponses)) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return response;
            }
        }

        // Default responses
        const defaultResponses = [
            'That\'s an interesting question! The Instant Interior platform supports multiple features. You can try switching textures or adjusting the view to experience them.',
            'I understand your question. This platform is mainly used for interior design preview and comparison. You can try different operations to explore the features.',
            'If you want to learn more about the features, you can try clicking the texture switch buttons on the right, or use mouse drag to rotate the view.',
            'Instant Interior is a professional interior design tool. If you have specific usage questions, I\'d be happy to help you!'
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // Event Listeners
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Remove the general floating button click handler
    // Only AI button should trigger chat expansion

    // Chat window close
    const chatClose = document.getElementById('chatClose');
    chatClose.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        floatingButton.classList.remove('expanded');
        // Reset to home button active state
        homeBtn.classList.add('active');
        aiBtn.classList.remove('active');
    });

    // Navigation button handlers
    homeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        // Reset to home view
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        homeBtn.classList.add('active');
        floatingButton.classList.remove('expanded');
    });

    textureBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        // Focus on texture controls
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        textureBtn.classList.add('active');
        floatingButton.classList.remove('expanded');
        
        // Scroll to texture panel or highlight it
        const texturePanel = document.querySelector('.texture-control-panel');
        if (texturePanel) {
            texturePanel.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                texturePanel.style.animation = '';
            }, 500);
        }
    });

    aiBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        // Toggle AI chat
        if (floatingButton.classList.contains('expanded')) {
            // Close AI chat
            floatingButton.classList.remove('expanded');
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            homeBtn.classList.add('active'); // Return to home state
        } else {
            // Open AI chat
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            aiBtn.classList.add('active');
            floatingButton.classList.add('expanded');
        }
    });

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        // Toggle menu or show options
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        menuBtn.classList.add('active');
        floatingButton.classList.remove('expanded');
        alert('Menu options coming soon!');
    });
}

// Launch Application
window.addEventListener('load', () => {
    init();
    setupTextureControls();
    setupChatBot();
});
