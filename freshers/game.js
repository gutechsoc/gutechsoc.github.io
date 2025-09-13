(() => {
    "use strict";

    /* ============================
       CONFIG / CONSTANTS
    ============================ */
    const GAME_W = 1600;
    let GAME_H = 900;

    let scale = 1, offX = 0, offY = 0;

    const isTouchLike = () => window.matchMedia("(pointer: coarse), (hover: none)").matches;
    const isWidescreen = () => window.matchMedia("(min-aspect-ratio: 16/10)").matches;

    let bottomSafeGU = 50;
    let difficulty = 1;
    let entityScale = 1;

    const PLAYER_SPEED_BASE = 5;
    const BULLET_SPEED = -7;

    let DEV_GODMODE = false;

    const PLAYER_WIDTH_FACTOR = 1.65;
    const BULLET_WIDTH_FACTOR = 1.50;

    const ENEMY_ENLARGE_FACTOR = 1.35;

    const ENEMY_TYPE_SIZE = {
        normal: 2.05,
        fast:   1.35,
        tank:   1.12,
        boss:   1.0
    };

    const ENEMY_FIRE_BASE_MS = 1400;

    const COLOR = {
        WHITE:'#FFFFFF', BLACK:'#000000', CYAN:'#00FFFF',
        GRAY:'#808080', RED:'#FF0000', GREEN:'#00FF00',
        BLUE:'#0000FF', YELLOW:'#FFFF00', ORANGE:'#FF6400'
    };

    const MAX_LEVEL = 7;

    /* ============================
       ASSETS
    ============================ */
    const IMG = {
        bg:'backdrop.PNG',
        player:'gunship.PNG',
        playerShield:'gunship.PNG', // placeholder

        ufoNormal:'notepad.PNG',
        ufoTank:'laptop.PNG',
        ufoSpeed:'iphone.PNG',
        ufoBoss:'extension.PNG',

        // stickers
        ufoNormalStamp:'notepad_stamped.PNG',
        ufoTankStamp:'laptop_stamped.PNG',
        ufoSpeedStamp:'iphone_stamped.PNG',

        // boss
        ufoBossGif:'extension.GIF',
        ufoBossStamp1:'extension_stamped1.GIF',
        ufoBossStamp2:'extension_stamped2.GIF',
        ufoBossStamp3:'extension_stamped3.GIF',
        ufoBossStamp4:'extension_stamped4.GIF',
        ufoBossStamp5:'extension_stamped5.GIF',

        // player bullets (placeholder powerups)
        laser:'stickerbullet.GIF',
        laserWide:'stickerbullet.GIF',
        laserPierce:'stickerbullet.GIF',
        laserBomb:'stickerbullet.GIF',
        laserDown:'bullet2.GIF',

        pWide:'powerup_bullet_wide.png',
        pPierce:'powerup_bullet_piercing.png',
        pBomb:'powerup_bomb.png',
        pShield:'powerup_shield.png',
        pScore:'powerup_score.png'
    };
    const SND = { shoot:'shooting.wav', boom:'explosion.wav' };
    const IMG_PATH = './images/', SND_PATH = './sounds/';

    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    /* ============================
       RESIZE / VIEW
    ============================ */
    function resize(){
        const winW = window.innerWidth, winH = window.innerHeight;
        canvas.width = winW; canvas.height = winH;

        if (isTouchLike() && !isWidescreen()) {
            const targetAspectHW = 16 / 9;
            GAME_H = Math.round(GAME_W * targetAspectHW);
            scale  = winW / GAME_W;
            offX   = 0;
            offY   = Math.round((winH - (GAME_H * scale)) / 2);
        } else {
            GAME_H = Math.max(700, Math.round(GAME_W * (winH / winW)));
            scale  = winW / GAME_W;
            offX   = 0; offY = 0;
        }

        let padPx = 0;
        const mobile = isTouchLike() && !isWidescreen();
        if (mobile) {
            const buttonHeightPx = Math.min(winH * 0.10, 110);
            const verticalOffsets = 45 + 16;
            padPx = buttonHeightPx + verticalOffsets;
        }
        bottomSafeGU = Math.max(110, Math.round(padPx / scale + 80));

        const mobileBoost = mobile ? 1.5 : 1.0;
        difficulty = Math.max(1, Math.min(2.5, (GAME_H / 900) * mobileBoost));
        entityScale = mobile ? 1.35 : 1;

        if (player) {
            player.h = Math.round(75 * entityScale);
            player.w = Math.round(75 * entityScale * PLAYER_WIDTH_FACTOR);
            player.onResize();
        }
        mobs.forEach(m => {
            if (m.img) {
                m.w = Math.round(m.img.w * m.scale);
                m.h = Math.round(m.img.h * m.scale);
            }
            if (m.gifEl) positionGifEl(m);
        });
        powerups.forEach(p => {
            p.w = Math.round(p.img.w * entityScale);
            p.h = Math.round(p.img.h * entityScale);
            if (p.onResize) p.onResize();
        });
        bullets.forEach(b => { if (b.gifEl) positionGifEl(b); });
        enemyBullets.forEach(b => { if (b.gifEl) positionGifEl(b); });
    }
    addEventListener('resize', resize);

    /* ============================
       LOADING
    ============================ */
    const images = {};
    const sounds = {};
    const imageDefs = [
        ['bg', IMG.bg, GAME_W, 900],
        ['player', IMG.player, 75, 75],
        ['playerShield', IMG.playerShield, 75, 75],

        ['ufoNormal', IMG.ufoNormal, 36, 36],
        ['ufoTank',   IMG.ufoTank,   50, 50],
        ['ufoSpeed',  IMG.ufoSpeed,  36, 36],
        ['ufoBoss',   IMG.ufoBoss,  150,150],

        // sticker
        ['ufoNormalStamp', IMG.ufoNormalStamp, 36, 36],
        ['ufoTankStamp',   IMG.ufoTankStamp,   50, 50],
        ['ufoSpeedStamp',  IMG.ufoSpeedStamp,  36, 36],

        // bullets
        ['laser',     IMG.laser,     20, 50],
        ['laserWide', IMG.laserWide, 60,100],
        ['laserPierce',IMG.laserPierce,10,100],
        ['laserBomb', IMG.laserBomb, 30, 50],
        ['laserDown', IMG.laserDown, 18, 42],

        // powerups
        ['pWide',   IMG.pWide,   30, 30],
        ['pPierce', IMG.pPierce, 30, 30],
        ['pBomb',   IMG.pBomb,   30, 30],
        ['pShield', IMG.pShield, 30, 30],
        ['pScore',  IMG.pScore,  30, 30]
    ];

    function loadImage(key, file, w, h){
        return new Promise(resolve=>{
            const img = new Image();
            img.onload = () => resolve({ key, img, w, h });
            img.onerror = () => {
                const c = document.createElement('canvas'); c.width = w; c.height = h;
                const g = c.getContext('2d'); g.fillStyle = '#f00'; g.fillRect(0,0,w,h);
                resolve({ key, img: c, w, h });
            };
            img.src = IMG_PATH + file;
        });
    }
    function loadAudio(key, file){
        const a = new Audio(); a.src = SND_PATH + file; a.preload = 'auto'; sounds[key] = a;
    }
    async function loadAssets(){
        const loaded = await Promise.all(imageDefs.map(([k,f,w,h]) => loadImage(k,f,w,h)));
        loaded.forEach(({ key, img, w, h }) => images[key] = { img, w, h });
        loadAudio('shoot', SND.shoot); loadAudio('boom', SND.boom);
    }
    function tryPlay(a){ a && a.play().catch(()=>{}); }

    /* ============================
       INPUT
    ============================ */
    const input = { left:false, right:false, fireEdge:false, _fireHeld:false };

    addEventListener('keydown', e=>{
        if (state !== 'PLAYING') return;
        if (e.code==='ArrowLeft'||e.code==='KeyA')  input.left  = true;
        if (e.code==='ArrowRight'||e.code==='KeyD') input.right = true;
        if (e.code==='Space'){ if(!input._fireHeld) input.fireEdge = true; input._fireHeld = true; e.preventDefault(); }
    });
    addEventListener('keyup', e=>{
        if (state !== 'PLAYING') return;
        if (e.code==='ArrowLeft'||e.code==='KeyA')  input.left  = false;
        if (e.code==='ArrowRight'||e.code==='KeyD') input.right = false;
        if (e.code==='Space') input._fireHeld = false;
    });

    const padLeft  = document.getElementById('padLeft');
    const padRight = document.getElementById('padRight');
    const padFire  = document.getElementById('padFire');
    function bindPad(el, down, up){
        const onDown = e => { e.preventDefault(); el.classList.add('active'); down(); };
        const onUp   = e => { e.preventDefault(); el.classList.remove('active'); up(); };
        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
        el.addEventListener('pointerleave', onUp);
    }
    bindPad(padLeft,  () => input.left  = true, () => input.left  = false);
    bindPad(padRight, () => input.right = true, () => input.right = false);
    bindPad(padFire,  () => { if(!input._fireHeld) input.fireEdge = true; input._fireHeld = true; },
        () => { input._fireHeld = false; });

    /* ============================
       DOM GIF OVERLAYS
    ============================ */
    function createGifEl(src){
        const el = new Image();
        el.src = IMG_PATH + src;
        el.alt = ''; el.draggable = false;
        el.style.position = 'fixed';
        el.style.left = '0px'; el.style.top  = '0px';
        el.style.width = '0px'; el.style.height = '0px';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '2';
        document.body.appendChild(el);
        return el;
    }
    function removeGifEl(el){
        if (!el) return;
        try { el.remove(); } catch(_) {}
    }
    function positionGifEl(o){
        if (!o.gifEl) return;
        o.gifEl.style.left   = (offX + o.x * scale) + 'px';
        o.gifEl.style.top    = (offY + o.y * scale) + 'px';
        o.gifEl.style.width  = (o.w * scale) + 'px';
        o.gifEl.style.height = (o.h * scale) + 'px';
        o.gifEl.style.visibility = (o.y > -o.h && o.y < GAME_H + o.h) ? 'visible' : 'hidden';
    }

    /* ============================
       GAME OBJECTS
    ============================ */
    function rectsOverlap(a,b){
        return a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y;
    }

    class Player{
        constructor(game){
            this.g = game;
            this.h = Math.round(75 * entityScale);
            this.w = Math.round(75 * entityScale * PLAYER_WIDTH_FACTOR);
            this.x = (GAME_W - this.w)/2;
            this.y = GAME_H - bottomSafeGU - this.h;
            this.shielded = false;
        }
        onResize(){
            this.y = GAME_H - bottomSafeGU - this.h;
            this.x = Math.max(0, Math.min(GAME_W - this.w, this.x));
        }
        get img(){ return this.shielded ? images.playerShield.img : images.player.img; }
        update(){
            const speed = this.g.playerSpeed;
            if (input.left && !input.right) this.x -= speed;
            else if (input.right && !input.left) this.x += speed;
            this.x = Math.max(0, Math.min(GAME_W - this.w, this.x));
        }
        draw(){ ctx.drawImage(this.img, this.x, this.y, this.w, this.h); }
        shield(){ this.shielded = true; }
        unshield(){ this.shielded = false; }
        get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
    }

    class Mob{
        constructor(x,y,speed,health,img,stampImg,worth, scale=1, kind='normal', gifSrcs=null){
            this.x=x; this.y=y; this.baseSpeed=speed; this.health=health;
            this.img=img; this.stampImg = stampImg || img; this.worth=worth; this.counter=0;
            this.scale = scale;
            this.w = Math.round(img.w * scale);
            this.h = Math.round(img.h * scale);
            this.kind = kind;

            this.bossHits = 0;
            this.frozen = false;
            this.dieAt = 0;
            this.gifEl = null;
            this.gifSrcs = gifSrcs;

            if (this.kind === 'boss' && this.gifSrcs && this.gifSrcs.base){
                this.gifEl = createGifEl(this.gifSrcs.base);
                this.gifEl.onerror = () => { removeGifEl(this.gifEl); this.gifEl = null; };
                positionGifEl(this);
            }
        }
        update(){
            if (this.frozen) return;
            const intervalBase = 20;
            const interval = Math.max(5, Math.round(intervalBase / difficulty));
            if (this.counter % interval === 0) this.y += this.baseSpeed * difficulty * 1.15;
            if (this.counter === 0) this.x += 50;
            else if (this.counter === 1000) this.x -= 50;
            this.counter = (this.counter + 1) % 2000;
        }
        draw(){
            if (this.gifEl) positionGifEl(this);
            else ctx.drawImage(this.img.img, this.x, this.y, this.w, this.h);
        }
        destroy(){ if (this.gifEl) { removeGifEl(this.gifEl); this.gifEl = null; } }
        setBossStage(stage){
            if (!this.gifSrcs) return;
            const idx = Math.max(1, Math.min(5, stage|0));
            const src = this.gifSrcs.stages[idx-1];
            if (!src) return;
            if (this.gifEl){
                this.gifEl.src = IMG_PATH + src;
            } else {
                this.img = images.ufoBoss;
            }
        }
        get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
    }

    class Bullet{
        constructor(x,y,type){
            this.type=type;
            const map = { laser:images.laser, BulletWidth:images.laserWide, BulletPiercing:images.laserPierce, BulletBomb:images.laserBomb };
            this.img = map[type || 'laser'];

            this.w = Math.round(this.img.w * BULLET_WIDTH_FACTOR);
            this.h = this.img.h;
            this.x = x - this.w/2; this.y = y - this.h;
            this.vy = BULLET_SPEED * (0.9 + 0.35*(difficulty-1));
            this.hp = (type==='BulletWidth') ? 3 : (type==='BulletPiercing') ? 5 : 1;

            this.gifEl = createGifEl(IMG.laser);
            this.gifEl.onerror = () => { removeGifEl(this.gifEl); this.gifEl = null; };
            positionGifEl(this);
        }
        update(){ this.y += this.vy; }
        draw(){
            if (this.gifEl) positionGifEl(this);
            else ctx.drawImage(this.img.img, this.x, this.y, this.w, this.h);
        }
        destroy(){ if (this.gifEl) { removeGifEl(this.gifEl); this.gifEl = null; } }
        get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
        get offscreen(){ return this.y + this.h < 0; }
    }

    class EnemyBullet{
        constructor(x,y){
            const img = images.laserDown;
            const scaleEB = Math.max(1, entityScale * 0.95);
            this.img = img;
            this.w = Math.round(img.w * scaleEB);
            this.h = Math.round(img.h * scaleEB);
            this.x = Math.round(x - this.w/2);
            this.y = Math.round(y);
            this.vy = 3.8 + difficulty * 1.7;

            this.gifEl = createGifEl(IMG.laserDown);
            this.gifEl.onerror = () => { removeGifEl(this.gifEl); this.gifEl = null; };
            positionGifEl(this);
        }
        update(){ this.y += this.vy; }
        draw(){
            if (this.gifEl) positionGifEl(this);
            else ctx.drawImage(this.img.img, this.x, this.y, this.w, this.h);
        }
        destroy(){ if (this.gifEl) { removeGifEl(this.gifEl); this.gifEl = null; } }
        get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
        get offscreen(){ return this.y > GAME_H + 50; }
    }

    class Flash{
        constructor(x,y,w,h,durMs, img){
            this.x=x; this.y=y; this.w=w; this.h=h; this.t=durMs; this.img=img;
        }
        update(dtMs){ this.t -= dtMs; }
        draw(){ ctx.drawImage(this.img.img, this.x, this.y, this.w, this.h); }
        get done(){ return this.t <= 0; }
    }

    /* ============================
       STATE / UI
    ============================ */
    let state = 'LOADING';
    let username = '';
    let player = null;
    let mobs = [];
    let bullets = [];
    let enemyBullets = [];
    let effects = [];
    let powerups = [];
    let score = 0, level = 0, levelBannerAt = 0;
    let bulletPower = null, maxBullets = 3, bulletsNum = 3, bulletReloadTimer = 0;
    let playerSpeed = PLAYER_SPEED_BASE;
    let highScores = [];
    const hiKey = 'si_high_scores';

    let enemyFireTimer = 0;
    let enemyNextInterval = 1.0;

    const gate = document.getElementById('nameGate');
    const nameInput = document.getElementById('playerName');
    const nameBtn   = document.getElementById('nameContinue');
    nameBtn.addEventListener('click', ()=>{
        username = (nameInput.value || 'Player').slice(0,20);
        gate.style.display = 'none';
        state = 'MAIN_MENU';
    });
    function showNameGate(){
        gate.style.display = 'flex';
        nameInput.value = username || '';
        setTimeout(()=> nameInput.focus(), 0);
    }

    function saveHighScores(){
        const rec = { name: username || 'Player', score, level };
        highScores.push(rec);
        highScores.sort((a,b)=> (b.score - a.score) || (b.level - a.level));
        highScores = highScores.slice(0,10);
        localStorage.setItem(hiKey, JSON.stringify(highScores));
    }
    function loadHighScores(){
        try { highScores = JSON.parse(localStorage.getItem(hiKey) || '[]'); }
        catch { highScores = []; }
    }
    function randomEnemyIntervalSec(){
        const base = ENEMY_FIRE_BASE_MS / 1000 / Math.max(1, difficulty);
        return base * (0.8 + Math.random() * 0.4);
    }
    function bottomRowMobs(){
        const out = [];
        for (const m of mobs){
            const hasBelow = mobs.some(o =>
                o !== m &&
                Math.abs((o.x + o.w/2) - (m.x + m.w/2)) < Math.max(m.w, o.w) * 0.5 &&
                (o.y > m.y)
            );
            if (!hasBelow) out.push(m);
        }
        return out;
    }

    /* ============================
       WAVES
    ============================ */
    function createMobsForLevel(){
        const T = {
            normal:[2,1, images.ufoNormal, images.ufoNormalStamp || images.ufoNormal, 1, 'normal', null],
            tank:[1,2, images.ufoTank, images.ufoTankStamp || images.ufoTank, 2, 'tank', null],
            fast:[4,1, images.ufoSpeed, images.ufoSpeedStamp || images.ufoSpeed, 2, 'fast', null],
            boss:[1,999999, images.ufoBoss, images.ufoBoss, 50, 'boss', {
                base: IMG.ufoBossGif || null,
                stages: [
                    IMG.ufoBossStamp1 || null,
                    IMG.ufoBossStamp2 || null,
                    IMG.ufoBossStamp3 || null,
                    IMG.ufoBossStamp4 || null,
                    IMG.ufoBossStamp5 || null
                ].filter(Boolean)
            }]
        };

        const cfg = {
            1:[[9,3,  500, 60, 60,'normal']],
            2:[[11,4, 440, 60, 60,'normal'], [15,2, 320,-80,60,'normal']],
            3:[[11,5, 440, 60, 60,'normal'], [15,3, 320,-120,60,'normal'], [15,2,320,-100,60,'fast']],
            4:[[11,5, 440,  60, 60,'normal'], [15,4, 320,-150,60,'normal'], [15,3,320,-130,60,'fast'], [ 9,3,360,-260,80,'tank']],
            5:[[11,5, 440,  60, 60,'normal'], [15,5, 320,-240,60,'normal'], [ 8,4,360,-480,85,'tank'], [15,5,320,-350,60,'fast'], [1,1,780,-400,0,'boss']],
            6:[[5,1,  780,   100, 300,'boss']]
        }[level] || [];

        const mobile = isTouchLike() && !isWidescreen();
        const spacingX = mobile ? 1.25 : 1.0;
        const spacingY = mobile ? 1.35 : 1.0;

        for (const [w,h,ox,oy,dist,key] of cfg){
            const [speed,health,img,stampImg,worth,kind,gifSrcs] = T[key];

            const distX = Math.round(dist * spacingX);
            const distY = Math.round(dist * spacingY);

            const rawW = img.w, rawH = img.h;
            const typeMul = ENEMY_TYPE_SIZE[key] ?? 1.0;
            const baseScale = (mobile ? Math.min(entityScale * 0.85, 1.0) : entityScale)
                * ENEMY_ENLARGE_FACTOR * typeMul;

            const marginX = 60;
            const availableWidth  = GAME_W - 2 * marginX;

            const topY = Math.max(0, oy);
            const bottomLimit = GAME_H - bottomSafeGU - 80;
            const availableHeight = Math.max(200, bottomLimit - topY);

            const fitX = (availableWidth  - (w - 1) * distX) / rawW;
            const fitY = (availableHeight - (h - 1) * distY) / rawH;

            const scaleFit = Math.min(baseScale, fitX, fitY);
            const finalScale = Math.max(0.45, Math.min(scaleFit, baseScale));

            const formationWidth = (w - 1) * distX + rawW * finalScale;
            const startX = Math.round((GAME_W - formationWidth) / 2);

            for (let x=0;x<w;x++){
                for (let y=0;y<h;y++){
                    const xPos = startX + x * distX;
                    const yPos = oy + y * distY;
                    mobs.push(new Mob(xPos, yPos, speed, health, img, stampImg, worth, finalScale, kind, key==='boss' ? {
                        base: IMG.ufoBossGif || null,
                        stages: [
                            IMG.ufoBossStamp1 || null,
                            IMG.ufoBossStamp2 || null,
                            IMG.ufoBossStamp3 || null,
                            IMG.ufoBossStamp4 || null,
                            IMG.ufoBossStamp5 || null
                        ].filter(Boolean)
                    } : null));
                }
            }
        }

        if (level === 3) maxBullets = 4;
        if (level === 5) maxBullets = 5;
        bulletsNum = maxBullets;

        enemyFireTimer = 0;
        enemyNextInterval = randomEnemyIntervalSec();
    }

    function destroyAllMobs(){
        for (const m of mobs) m.destroy();
        mobs = [];
    }
    function destroyList(arr){
        for (const o of arr){ if (o && typeof o.destroy === 'function') o.destroy(); }
        arr.length = 0;
    }

    function resetGame(){
        destroyAllMobs();
        destroyList(bullets);
        destroyList(enemyBullets);
        effects = []; powerups = [];
        score = 0; level = 0; levelBannerAt = 0;
        bulletPower = null; maxBullets = 3; bulletsNum = maxBullets; bulletReloadTimer = 0;

        const tiny = (Math.min(innerWidth, innerHeight) < 720);
        playerSpeed = tiny ? Math.max(PLAYER_SPEED_BASE, 6) : PLAYER_SPEED_BASE;

        player = new Player({ playerSpeed });
        player.g = { playerSpeed };
        player.onResize();

        for (let i=0;i<2;i++) powerups.push(new PowerUp(images));
        enemyFireTimer = 0;
        enemyNextInterval = randomEnemyIntervalSec();
    }

    class PowerUp{
        constructor(images, includeShield=true){
            this.images=images;
            this.randomize(includeShield);
            this.spawnAt=performance.now();
        }
        randomize(includeShield){
            const choices=['BulletWidth','BulletPiercing','BulletBomb','Shield','Score'];
            if (!includeShield) choices.splice(choices.indexOf('Shield'),1);
            this.type = choices[(Math.random()*choices.length)|0];
            const map={BulletWidth:'pWide',BulletPiercing:'pPierce',BulletBomb:'pBomb',Shield:'pShield',Score:'pScore'};
            this.img=this.images[map[this.type]];
            this.w=Math.round(this.img.w * entityScale);
            this.h=Math.round(this.img.h * entityScale);

            const top = Math.max(380, Math.floor(GAME_H * 0.50));
            const bottom = Math.max(top + 50, Math.floor(GAME_H - bottomSafeGU - 40));
            this.x = 100 + Math.random()*(GAME_W - 200 - this.w);
            this.y = top + Math.random()*Math.max(10, (bottom - top) - this.h);
            this.spawnAt=performance.now();
        }
        onResize(){ this.y = Math.min(this.y, GAME_H - bottomSafeGU - 60 - this.h); }
        update(){ if (performance.now()-this.spawnAt > 10000) this.randomize(true); }
        draw(){ ctx.drawImage(this.img.img, this.x, this.y, this.w, this.h); }
        get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
    }

    /* ============================
       DRAW HELPERS / HUD
    ============================ */
    function drawText(str,x,y,size=24,color='#fff',align='left'){
        ctx.fillStyle = color;
        ctx.font = `bold ${size}px system-ui,-apple-system,Segoe UI,Roboto,Arial`;
        ctx.textAlign = align; ctx.textBaseline = 'top';
        ctx.fillText(str,x,y);
    }
    function drawHUD(){
        const hudSize = (isTouchLike() && !isWidescreen()) ? 34 : 26;
        const hudLine = hudSize + 8;
        drawText(`Score: ${score}`, 100, 10, hudSize, COLOR.CYAN);
        drawText(`High: ${Math.max(score, highScores[0]?.score || 0)}`, 100, 10 + hudLine, hudSize, COLOR.BLUE);
        drawText(`Level: ${level}`, 100, 10 + 2*hudLine, hudSize, COLOR.WHITE);

        const col = bulletPower==='BulletWidth' ? COLOR.YELLOW
            : bulletPower==='BulletPiercing' ? COLOR.ORANGE
                : bulletPower==='BulletBomb' ? COLOR.GRAY : COLOR.WHITE;
        const ammoSize = (isTouchLike() && !isWidescreen()) ? 34 : 26;
        const ammoLabel = DEV_GODMODE ? '∞' : String(bulletsNum);
        drawText(`Ammo: ${ammoLabel}`, player.x + player.w/2, player.y - 30, ammoSize, col, 'center');

        if (DEV_GODMODE){
            drawText('GODMODE', GAME_W - 40, 10, 18, COLOR.ORANGE, 'right');
        }

        if (performance.now() - levelBannerAt < 2000)
            drawText(`Level ${level}`, GAME_W/2, GAME_H/2 - 25, 50, COLOR.WHITE, 'center');
    }

    /* ============================
       LOOP
    ============================ */
    let last = performance.now();
    function loop(now){
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const dtMs = dt * 1000;

        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.setTransform(scale,0,0,scale, offX, offY);

        ctx.drawImage(images.bg.img, 0, 0, GAME_W, GAME_H);

        if (state === 'MAIN_MENU'){
            drawText("GUTS Space Invaders", GAME_W/2, 180, 64, COLOR.BLACK, 'center');
            drawText(`Welcome, ${username || 'Player'}`, GAME_W/2, 270, 32, COLOR.CYAN, 'center');
            drawText("Tap / Click to Play", GAME_W/2, 360, 28, COLOR.GRAY, 'center');
            drawText("Press H for How To", GAME_W/2, 400, 22, COLOR.WHITE, 'center');
        }

        if (state === 'INSTRUCTIONS'){
            drawText("How to Play", GAME_W/2, 60, 64, COLOR.WHITE, 'center');
            const lines=[
                "Move: Arrow Keys or ◀ ▶ (mobile)",
                "Shoot: Space or FIRE button",
                "Enemies now shoot back — dodge!",
                "",
                "Power-ups: Orange=Piercing, Yellow=Wide, Grey=Bomb",
                "Shield = survive one hit, Cyan = +5 score",
                "",
                "Tap / click to return"
            ];
            let y=160; lines.forEach(t=>{ drawText(t, 100, y, 28, COLOR.BLACK); y+=36; });
        }

        if (state === 'PLAYING'){
            if (input.fireEdge && (DEV_GODMODE || bulletsNum>0)){
                bullets.push(new Bullet(
                    player.x + player.w/2, player.y, bulletPower
                ));
                bulletPower=null;
                if (!DEV_GODMODE) bulletsNum--;
                input.fireEdge=false;
                tryPlay(sounds.shoot);
            } else input.fireEdge=false;

            player.update();
            mobs.forEach(m=>m.update());
            bullets.forEach(b=>b.update());
            powerups.forEach(p=>p.update());
            enemyBullets.forEach(b=>b.update());
            effects.forEach(f=>f.update(dtMs));

            enemyFireTimer += dt;
            if (enemyFireTimer >= enemyNextInterval){
                enemyFireTimer = 0;
                enemyNextInterval = randomEnemyIntervalSec();
                const shooters = bottomRowMobs();
                if (shooters.length){
                    const s = shooters[(Math.random()*shooters.length)|0];
                    enemyBullets.push(new EnemyBullet(s.x + s.w/2, s.y + s.h));
                }
            }

            for (let i=mobs.length-1; i>=0; i--){
                const m = mobs[i];
                if (m.frozen && performance.now() >= m.dieAt){
                    m.destroy();
                    mobs.splice(i,1);
                    score += m.worth;
                    tryPlay(sounds.boom);
                }
            }

            if (mobs.length === 0){
                level++; levelBannerAt = performance.now();
                if (level >= MAX_LEVEL){ state='GAME_OVER'; saveHighScores(); }
                else createMobsForLevel();
            }

            for (let i=mobs.length-1;i>=0;i--){
                const m=mobs[i];
                if (m.y + m.h > GAME_H){
                    if (!DEV_GODMODE){ state='GAME_OVER'; saveHighScores(); }
                    break;
                }
                if (rectsOverlap(player.rect, m.rect)){
                    if (DEV_GODMODE){
                        score += m.worth; m.destroy(); mobs.splice(i,1); tryPlay(sounds.boom);
                        continue;
                    }
                    if (player.shielded){ player.unshield(); score += m.worth; m.destroy(); mobs.splice(i,1); tryPlay(sounds.boom); }
                    else { state='GAME_OVER'; saveHighScores(); break; }
                }
            }

            for (let bi=bullets.length-1; bi>=0; bi--){
                const b=bullets[bi]; let hit=false;
                for (let mi=0; mi<mobs.length; mi++){
                    const m=mobs[mi];
                    if (!rectsOverlap(b.rect,m.rect)) continue;
                    hit=true;

                    if (m.kind === 'boss'){
                        m.bossHits++;
                        const stage = Math.floor(m.bossHits / 2);
                        if (stage >= 1 && stage <= 5) m.setBossStage(stage);
                        if (m.bossHits >= 10 && !m.frozen){
                            m.frozen = true;
                            m.dieAt = performance.now() + 1000;
                        }
                        if (b.type === 'BulletPiercing') {
                            b.hp -= 1;
                            if (b.hp <= 0) { b.destroy(); bullets.splice(bi,1); }
                        } else {
                            if (b.type==='BulletBomb'){
                                const r2=80*80, cx=b.x+b.w/2, cy=b.y+b.h/2;
                                for (const m2 of mobs){
                                    const dx=(m2.x+m2.w/2)-cx, dy=(m2.y+m2.h/2)-cy;
                                    if (dx*dx+dy*dy < r2 && m2!==m) m2.health -= 1;
                                }
                            }
                            b.destroy(); bullets.splice(bi,1);
                        }
                    } else {
                        m.health -= Math.max(1, b.hp);
                        if (b.type === 'BulletPiercing'){
                            b.hp -= 1;
                            if (b.hp <= 0){ b.destroy(); bullets.splice(bi,1); }
                        } else {
                            if (b.type==='BulletBomb'){
                                const r2=80*80, cx=b.x+b.w/2, cy=b.y+b.h/2;
                                for (const m2 of mobs){
                                    const dx=(m2.x+m2.w/2)-cx, dy=(m2.y+m2.h/2)-cy;
                                    if (dx*dx+dy*dy < r2) m2.health -= 1;
                                }
                            }
                            b.destroy(); bullets.splice(bi,1);
                        }
                        if (m.health <= 0){
                            effects.push(new Flash(m.x, m.y, m.w, m.h, 200, m.stampImg || m.img));
                            m.destroy();
                            mobs.splice(mi,1);
                            score += m.worth;
                            tryPlay(sounds.boom);
                        }
                    }
                    break;
                }
                if (!hit && bullets[bi] && bullets[bi].offscreen){ bullets[bi].destroy(); bullets.splice(bi,1); }
            }

            for (let ei = enemyBullets.length-1; ei>=0; ei--){
                const eb = enemyBullets[ei];
                if (rectsOverlap(eb.rect, player.rect)){
                    if (DEV_GODMODE){ eb.destroy(); enemyBullets.splice(ei,1); continue; }
                    if (player.shielded){ player.unshield(); eb.destroy(); enemyBullets.splice(ei,1); }
                    else { state='GAME_OVER'; saveHighScores(); break; }
                } else if (eb.offscreen){
                    eb.destroy(); enemyBullets.splice(ei,1);
                }
            }

            for (const pu of powerups){
                for (const b of bullets){
                    if (rectsOverlap(pu.rect,b.rect)){
                        if (pu.type==='Shield') player.shield();
                        else if (pu.type.startsWith('Bullet')) bulletPower=pu.type;
                        else if (pu.type==='Score') score+=5;
                        pu.randomize(!player.shielded); break;
                    }
                }
            }

            if (bulletsNum < maxBullets && !DEV_GODMODE){
                bulletReloadTimer += difficulty;
                if (bulletReloadTimer >= 50){ bulletsNum++; bulletReloadTimer = 0; }
            }

            effects = effects.filter(f => !f.done);

            powerups.forEach(p=>p.draw());
            mobs.forEach(m=>m.draw());
            enemyBullets.forEach(b=>b.draw());
            bullets.forEach(b=>b.draw());
            player.draw();
            effects.forEach(f=>f.draw());
            drawHUD();
        }

        if (state === 'GAME_OVER'){
            drawText("GAME OVER", GAME_W/2, 100, 64, COLOR.RED, 'center');
            drawText(`Final Score: ${score}`, GAME_W/2, 180, 40, COLOR.CYAN, 'center');
            drawText("Top Scores", GAME_W/2, 250, 36, COLOR.YELLOW, 'center');
            for (let i=0;i<highScores.length;i++){
                const r=highScores[i]; const y=300 + i*34;
                drawText(`${i+1}.`, 350, y, 26, COLOR.WHITE);
                drawText(r.name, 450, y, 26, COLOR.WHITE);
                drawText(String(r.score), 750, y, 26, COLOR.WHITE, 'right');
            }
            drawText("Tap / Click to play again", GAME_W/2, 700, 24, COLOR.GRAY, 'center');
        }

        requestAnimationFrame(loop);
    }

    /* ============================
       NAVIGATION
    ============================ */
    canvas.addEventListener('pointerdown', ()=>{
        if (state==='MAIN_MENU'){ state='PLAYING'; resetGame(); createMobsForLevel(); tryPlay(sounds.shoot); }
        else if (state==='INSTRUCTIONS'){ state='MAIN_MENU'; }
        else if (state==='GAME_OVER'){ state='PLAYING'; resetGame(); createMobsForLevel(); tryPlay(sounds.shoot); }
    });
    addEventListener('keydown', e=>{
        if (state === 'PLAYING' && !isTouchLike() && e.code === 'KeyK' && e.ctrlKey && e.altKey && e.shiftKey){
            level++; levelBannerAt = performance.now();
            destroyAllMobs(); destroyList(bullets); destroyList(enemyBullets); effects = [];
            if (level >= MAX_LEVEL){ state = 'GAME_OVER'; saveHighScores(); }
            else { createMobsForLevel(); }
            return;
        }

        if (state==='MAIN_MENU' && (e.code==='Enter'||e.code==='Space')){ state='PLAYING'; resetGame(); createMobsForLevel(); }
        else if (state==='MAIN_MENU' && e.code==='KeyH'){ state='INSTRUCTIONS'; }
        else if (state==='INSTRUCTIONS' && ['Escape','Backspace','Enter','Space'].includes(e.code)){ state='MAIN_MENU'; }
        else if (state==='GAME_OVER' && (e.code==='Enter'||e.code==='Space')){ state='PLAYING'; resetGame(); createMobsForLevel(); }
    });

    /* ============================
       BOOT
    ============================ */
    async function boot(){
        await loadAssets();
        try { highScores = JSON.parse(localStorage.getItem(hiKey) || '[]'); }
        catch { highScores = []; }

        username = (localStorage.getItem('si_username') || '');
        nameInput.addEventListener('input', () => localStorage.setItem('si_username', nameInput.value));
        state = username ? 'MAIN_MENU' : 'USERNAME_INPUT';
        if (!username) { const gate = document.getElementById('nameGate'); gate.style.display = 'flex'; setTimeout(()=> nameInput.focus(), 0); }

        resize();
        requestAnimationFrame(loop);
    }

    boot();

})();
