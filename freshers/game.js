(() => {
    "use strict";

    /* ============================
       CONFIG / CONSTANTS
    ============================ */
    const GAME_W = 1600;
    let GAME_H = 900;

    let scale = 1, offX = 0, offY = 0;
    let entityScale = 1;

    const isTouchLike = () =>
        window.matchMedia("(pointer: coarse), (hover: none)").matches;
    const isWidescreen = () =>
        window.matchMedia("(min-aspect-ratio: 16/10)").matches;

    let bottomSafeGU = 300;

    let difficulty = 1;

    const COLOR = {
        WHITE:'#FFFFFF', BLACK:'#000000', CYAN:'#00FFFF',
        GRAY:'#808080', RED:'#FF0000', GREEN:'#00FF00',
        BLUE:'#0000FF', YELLOW:'#FFFF00', ORANGE:'#FF6400'
    };

    const MAX_LEVEL = 7;
    const PLAYER_SPEED_BASE = 5;
    const BULLET_SPEED = -7;

    const IMG = {
        bg:'space.png',
        player:'player.png',
        playerShield:'player_shielded.png',
        ufoNormal:'ufo_normal.png',
        ufoTank:'ufo_tank.png',
        ufoSpeed:'ufo_speed.png',
        ufoBoss:'ufo_boss.png',
        laser:'laser.png',
        laserWide:'laser_yellow.png',
        laserPierce:'laser_orange.png',
        laserBomb:'laser_grey.png',
        pWide:'powerup_bullet_wide.png',
        pPierce:'powerup_bullet_piercing.png',
        pBomb:'powerup_bomb.png',
        pShield:'powerup_shield.png',
        pScore:'powerup_score.png'
    };
    const SND = { shoot:'shooting.wav', boom:'explosion.wav' };
    const IMG_PATH = './images/', SND_PATH = './sounds/';

    /* ============================
       CANVAS + RESIZE (dynamic height)
    ============================ */
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    function resize(){
        const winW = window.innerWidth, winH = window.innerHeight;
        canvas.width = winW; canvas.height = winH;

        GAME_H = Math.max(700, Math.round(GAME_W * (winH / winW)));
        scale  = winW / GAME_W;
        offX   = 0; offY = 0;

        let padPx = 0;
        const mobile = isTouchLike() && !isWidescreen();
        if (mobile) {
            const buttonHeightPx = Math.min(winH * 0.10, 110);
            const verticalOffsets = 45 + 16;
            padPx = buttonHeightPx + verticalOffsets;
        }
        bottomSafeGU = Math.max(100, Math.round(padPx / scale + 60));

        const mobileBoost = mobile ? 1.5 : 1.0;
        difficulty = Math.max(1, Math.min(2.5, (GAME_H / 900) * mobileBoost));

        entityScale = mobile ? 1.35 : 1;

        if (player) {
            player.w = Math.round(75 * entityScale);
            player.h = Math.round(75 * entityScale);
            player.onResize();
        }
        mobs.forEach(m => {
            m.w = Math.round(m.img.w * entityScale);
            m.h = Math.round(m.img.h * entityScale);
        });
        powerups.forEach(p => {
            p.w = Math.round(p.img.w * entityScale);
            p.h = Math.round(p.img.h * entityScale);
            if (p.onResize) p.onResize();
        });
    }
    addEventListener('resize', resize);

    /* ============================
       ASSETS
    ============================ */
    const images = {};
    const sounds = {};
    const imageDefs = [
        ['bg', IMG.bg, GAME_W, 900],
        ['player', IMG.player, 75, 75],
        ['playerShield', IMG.playerShield, 75, 75],
        ['ufoNormal', IMG.ufoNormal, 36, 36],
        ['ufoTank', IMG.ufoTank, 50, 50],
        ['ufoSpeed', IMG.ufoSpeed, 36, 36],
        ['ufoBoss', IMG.ufoBoss, 150, 150],
        ['laser', IMG.laser, 20, 50],
        ['laserWide', IMG.laserWide, 60, 100],
        ['laserPierce', IMG.laserPierce, 10, 100],
        ['laserBomb', IMG.laserBomb, 30, 50],
        ['pWide', IMG.pWide, 30, 30],
        ['pPierce', IMG.pPierce, 30, 30],
        ['pBomb', IMG.pBomb, 30, 30],
        ['pShield', IMG.pShield, 30, 30],
        ['pScore', IMG.pScore, 30, 30],
    ];

    function loadImage(key, file, w, h){
        return new Promise(resolve=>{
            const img = new Image();
            img.onload = () => resolve({ key, img, w, h });
            img.onerror = () => {
                const c = document.createElement('canvas'); c.width = w; c.height = h;
                c.getContext('2d').fillStyle = '#f00';
                c.getContext('2d').fillRect(0,0,w,h);
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
       INPUT (keyboard + touch pads)
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
       GAME OBJECTS
    ============================ */
    function rectsOverlap(a,b){
        return a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y;
    }

    class Player{
        constructor(game){
            this.g = game;
            this.w = Math.round(75 * entityScale);
            this.h = Math.round(75 * entityScale);
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
        constructor(x,y,speed,health,img,worth){
            this.x=x; this.y=y; this.baseSpeed=speed; this.health=health;
            this.img=img; this.worth=worth; this.counter=0;
            this.w = Math.round(75 * entityScale);
            this.h = Math.round(75 * entityScale);
            this._interval=20;
        }
        update(){
            const interval = Math.max(5, Math.round(this._interval / difficulty));
            if (this.counter % interval === 0) this.y += this.baseSpeed * difficulty * 1.15;
            if (this.counter === 0) this.x += 50;
            else if (this.counter === 1000) this.x -= 50;
            this.counter = (this.counter + 1) % 2000;
        }
        draw(){ ctx.drawImage(this.img.img, this.x, this.y, this.w, this.h); }
        get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
    }

    class Bullet{
        constructor(x,y,type,map){
            this.type=type; this.img=map[type || 'laser'];
            this.w=this.img.w; this.h=this.img.h;
            this.x=x - this.w/2; this.y=y - this.h;
            this.vy = BULLET_SPEED * (0.9 + 0.35*(difficulty-1));
            this.hp = (type==='BulletWidth') ? 3 : (type==='BulletPiercing') ? 5 : 1;
        }
        update(){ this.y += this.vy; }
        draw(){ ctx.drawImage(this.img.img, this.x, this.y, this.w, this.h); }
        get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
        get offscreen(){ return this.y + this.h < 0; }
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
            this.w = Math.round(this.img.w * entityScale *  1.35);
            this.h = Math.round(this.img.h * entityScale * 1.35);

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
       GAME STATE
    ============================ */
    let state = 'LOADING';
    let username = '';
    let player = null;
    let mobs = [];
    let bullets = [];
    let powerups = [];
    let score = 0, level = 0, levelBannerAt = 0;
    let bulletPower = null, maxBullets = 3, bulletsNum = 3, bulletReloadTimer = 0;
    let playerSpeed = PLAYER_SPEED_BASE;
    let highScores = [];
    const hiKey = 'si_high_scores';

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

    function createMobsForLevel(){
        const T = {
            normal:[2,1, images.ufoNormal, 1],
            tank:[1,2, images.ufoTank, 2],
            fast:[4,1, images.ufoSpeed, 2],
            boss:[1,150, images.ufoBoss, 50]
        };
        const cfg = {
            1:[[9,3,  500, 60, 60,'normal']],
            2:[[11,4, 440, 60, 60,'normal'], [15,2, 320,-80,60,'normal']],
            3:[[11,5, 440, 60, 60,'normal'], [15,3, 320,-120,60,'normal'], [15,2,320,-100,60,'fast']],
            4:[[11,5, 440, 60, 60,'normal'], [15,4, 320,-150,60,'normal'], [15,3,320,-130,60,'fast'], [15,4,320,-140,70,'tank']],
            5:[[11,5, 440, 60, 60,'normal'], [15,5, 320,-240,60,'normal'], [15,5,220,-300,70,'tank'], [15,5,320,-350,60,'fast'], [1,1,780,-400,0,'boss']],
            6:[[2,1,  780,  0,  0,'boss']]
        }[level] || [];

        const mobile = isTouchLike() && !isWidescreen();
        const spacingX = mobile ? 2 : 1.35;
        const spacingY = mobile ? 2. : 1.35;

        for (const [w,h,ox,oy,dist,key] of cfg){
            const [speed,health,img,worth] = T[key];

            const distX = Math.round(dist * spacingX);
            const distY = Math.round(dist * spacingY);

            const startX = Math.round(ox + ((w - 1) * (dist - distX)) / 2);

            for (let x = 0; x < w; x++){
                for (let y = 0; y < h; y++){
                    const xPos = startX + x * distX;
                    const yPos = oy + y * distY;
                    mobs.push(new Mob(xPos, yPos, speed, health, img, worth));
                }
            }
        }

        if (level === 3) maxBullets = 4;
        if (level === 5) maxBullets = 5;
        bulletsNum = maxBullets;
    }

    function resetGame(){
        mobs = []; bullets = []; powerups = [];
        score = 0; level = 0; levelBannerAt = 0;
        bulletPower = null; maxBullets = 3; bulletsNum = maxBullets; bulletReloadTimer = 0;

        playerSpeed = (Math.min(innerWidth, innerHeight) < 720) ? Math.max(PLAYER_SPEED_BASE, 6) : PLAYER_SPEED_BASE;

        player = new Player({ playerSpeed });
        player.g = { playerSpeed };
        player.onResize();

        for (let i=0;i<2;i++) powerups.push(new PowerUp(images));
    }

    /* ============================
       DRAW HELPERS
    ============================ */
    function drawText(str,x,y,size=24,color='#fff',align='left'){
        ctx.fillStyle = color;
        ctx.font = `bold ${size}px system-ui,-apple-system,Segoe UI,Roboto,Arial`;
        ctx.textAlign = align; ctx.textBaseline = 'top';
        ctx.fillText(str, x, y);
    }
    function drawHUD(){
        const hudSize = (isTouchLike() && !isWidescreen()) ? 34 : 26;
        const hudLine = hudSize + 22;
        drawText(`Score: ${score}`, 100, 10, hudSize, COLOR.CYAN);
        const hi = highScores[0]?.score || 0;
        drawText(`High: ${Math.max(score, highScores[0]?.score || 0)}`, 100, 10 + hudLine, hudSize, COLOR.BLUE);
        drawText(`Level: ${level}`, 100, 10 + 2*hudLine, hudSize, COLOR.WHITE);

        const col = bulletPower==='BulletWidth' ? COLOR.YELLOW
            : bulletPower==='BulletPiercing' ? COLOR.ORANGE
                : bulletPower==='BulletBomb' ? COLOR.GRAY : COLOR.WHITE;
        const ammoSize = (isTouchLike() && !isWidescreen()) ? 34 : 26;
        drawText(`Ammo: ${bulletsNum}`, player.x + player.w/2, player.y - 30, ammoSize, col, 'center');

        if (performance.now() - levelBannerAt < 2000)
            drawText(`Level ${level}`, GAME_W/2, GAME_H/2 - 25, 50, COLOR.WHITE, 'center');
    }

    /* ============================
       LOOP
    ============================ */
    let last = performance.now();
    function loop(now){
        const dt = Math.min(0.05, (now - last) / 1000); last = now;

        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.setTransform(scale,0,0,scale, offX, offY);

        ctx.drawImage(images.bg.img, 0, 0, GAME_W, GAME_H);

        if (state === 'MAIN_MENU'){
            drawText("Space Invaders Clone", GAME_W/2, 180, 64, COLOR.WHITE, 'center');
            drawText(`Welcome, ${username || 'Player'}`, GAME_W/2, 270, 32, COLOR.CYAN, 'center');
            drawText("Tap / Click to Play", GAME_W/2, 360, 28, COLOR.WHITE, 'center');
            drawText("Press H for How To", GAME_W/2, 400, 22, COLOR.GRAY, 'center');
        }

        if (state === 'INSTRUCTIONS'){
            drawText("How to Play", GAME_W/2, 60, 64, COLOR.WHITE, 'center');
            const lines=[
                "Move: Arrow Keys or ◀ ▶ (mobile)",
                "Shoot: Space or FIRE button",
                "",
                "Power-ups: Orange=Piercing, Yellow=Wide, Grey=Bomb",
                "Shield = survive one hit, Cyan = +5 score",
                "",
                "Tap / click to return"
            ];
            let y=160; lines.forEach(t=>{ drawText(t, 100, y, 28, COLOR.WHITE); y+=36; });
        }

        if (state === 'PLAYING'){
            if (input.fireEdge && bulletsNum>0){
                bullets.push(new Bullet(
                    player.x + player.w/2, player.y, bulletPower,
                    { laser:images.laser, BulletWidth:images.laserWide, BulletPiercing:images.laserPierce, BulletBomb:images.laserBomb }
                ));
                bulletPower=null; bulletsNum--; input.fireEdge=false;
                tryPlay(sounds.shoot);
            } else input.fireEdge=false;

            player.update();
            mobs.forEach(m=>m.update());
            bullets.forEach(b=>b.update());
            powerups.forEach(p=>p.update());

            if (mobs.length===0){
                level++; levelBannerAt=performance.now();
                if (level>=MAX_LEVEL){ state='GAME_OVER'; saveHighScores(); }
                else createMobsForLevel();
            }

            for (let i=mobs.length-1;i>=0;i--){
                const m=mobs[i];
                if (m.y + m.h > GAME_H){ state='GAME_OVER'; saveHighScores(); break; }
                if (rectsOverlap(player.rect, m.rect)){
                    if (player.shielded){ player.unshield(); score += m.worth; mobs.splice(i,1); tryPlay(sounds.boom); }
                    else { state='GAME_OVER'; saveHighScores(); break; }
                }
            }
            for (let bi=bullets.length-1; bi>=0; bi--){
                const b=bullets[bi]; let hit=false;
                for (let mi=0; mi<mobs.length; mi++){
                    const m=mobs[mi];
                    if (!rectsOverlap(b.rect,m.rect)) continue;
                    hit=true;
                    const take=m.health; m.health-=b.hp; b.hp-=take;
                    if (b.hp<=0){
                        if (b.type==='BulletBomb'){
                            tryPlay(sounds.boom);
                            const r2=80*80, cx=b.x+b.w/2, cy=b.y+b.h/2;
                            for (const m2 of mobs){
                                const dx=(m2.x+m2.w/2)-cx, dy=(m2.y+m2.h/2)-cy;
                                if (dx*dx+dy*dy < r2) m2.health -= 1;
                            }
                        }
                        bullets.splice(bi,1);
                    }
                    break;
                }
                if (!hit && b.offscreen) bullets.splice(bi,1);
            }
            for (let i=mobs.length-1;i>=0;i--){
                if (mobs[i].health<=0){ score += mobs[i].worth; tryPlay(sounds.boom); mobs.splice(i,1); }
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

            if (bulletsNum < maxBullets){
                bulletReloadTimer += difficulty;
                if (bulletReloadTimer >= 50){ bulletsNum++; bulletReloadTimer = 0; }
            }

            powerups.forEach(p=>p.draw());
            mobs.forEach(m=>m.draw());
            bullets.forEach(b=>b.draw());
            player.draw();
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
        if (state==='MAIN_MENU' && (e.code==='Enter'||e.code==='Space')){ state='PLAYING'; resetGame(); createMobsForLevel(); }
        else if (state==='MAIN_MENU' && e.code==='KeyH'){ state='INSTRUCTIONS'; }
        else if (state==='INSTRUCTIONS' && ['Escape','Backspace','Enter','Space'].includes(e.code)){ state='MAIN_MENU'; }
        else if (state==='GAME_OVER' && (e.code==='Enter'||e.code==='Space')){ state='PLAYING'; resetGame(); createMobsForLevel(); }
    });

    /* ============================
       BOOT
    ============================ */
    let username_ = '';
    let highScores_ = [];
    const hiKey_ = 'si_high_scores';

    function loadHighScores(){
        try { highScores_ = JSON.parse(localStorage.getItem(hiKey_) || '[]'); }
        catch { highScores_ = []; }
    }

    function bootSyncUI(){
        username = (localStorage.getItem('si_username') || '');
        nameInput.addEventListener('input', () => localStorage.setItem('si_username', nameInput.value));
        if (!username_){ state='USERNAME_INPUT'; showNameGate(); }
        else { state='MAIN_MENU'; }
    }

    (async function boot(){
        await loadAssets();
        loadHighScores();
        bootSyncUI();
        resize();
        requestAnimationFrame(loop);
    })();

})();
