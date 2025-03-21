window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 일시정지 키 설정
    const pauseKey = 'Escape';

    // 뷰포트 크기 설정
    const viewport = {
        width: 600,
        height: 800
    };

    // 캔버스 크기 설정
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // 플레이어 객체 설정
    const player = {
        x: 2500,
        y: 2500,
        width: 30,
        height: 50,
        speed: 5,
        hp: 10, // 플레이어의 hp 속성 추가
        maxHp: 10
    };

    // 적 객체 배열
    const enemies = [];

    // 투사체 배열
    const projectiles = [];

    // 카메라 객체 설정
    const camera = {
        x: player.x - viewport.width / 2,
        y: player.y - viewport.height / 2
    };

    // 게임 오버 상태
    let isGameOver = false;

    // 플레이어를 그리는 함수
    function drawPlayer() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
        drawHealthBar(player);
    }

    // 적을 그리는 함수
    function drawEnemies() {
        ctx.fillStyle = 'red';
        enemies.forEach(enemy => {
            ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
            drawHealthBar(enemy);
            ctx.fillStyle = 'red';
        });
    }

    // 체력 바를 그리는 함수
    function drawHealthBar(entity) {
        const healthBarWidth = entity.width;
        const healthBarHeight = 10;
        const healthBarX = entity.x - camera.x;
        const healthBarY = entity.y - camera.y + entity.height + 5;
        const healthPercentage = entity.hp / entity.maxHp;

        ctx.fillStyle = 'red';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        ctx.fillStyle = 'green';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    }

    // 투사체를 그리는 함수
    function drawProjectiles() {
        ctx.fillStyle = 'yellow';
        projectiles.forEach(projectile => {
            ctx.fillRect(projectile.x - camera.x, projectile.y - camera.y, projectile.width, projectile.height);
        });
    }

    // 플레이어의 위치를 업데이트하는 함수
    function updatePlayer() {
        if (keys['w']) player.y -= player.speed; // 위로 이동
        if (keys['s']) player.y += player.speed; // 아래로 이동
        if (keys['a']) player.x -= player.speed; // 왼쪽으로 이동
        if (keys['d']) player.x += player.speed; // 오른쪽으로 이동
    }

    // 적의 위치를 업데이트하는 함수
    function updateEnemies() {
        enemies.forEach((enemy, index) => {
            if (player.x < enemy.x) enemy.x -= enemy.speed; // 플레이어를 향해 왼쪽으로 이동
            if (player.x > enemy.x) enemy.x += enemy.speed; // 플레이어를 향해 오른쪽으로 이동
            if (player.y < enemy.y) enemy.y -= enemy.speed; // 플레이어를 향해 위로 이동
            if (player.y > enemy.y) enemy.y += enemy.speed; // 플레이어를 향해 아래로 이동

            let collisionDetected = false;

            // 적 객체끼리의 충돌을 확인하고 충돌 시 속도 차이를 둠
            enemies.forEach((otherEnemy, otherIndex) => {
                if (index !== otherIndex &&
                    enemy.x < otherEnemy.x + otherEnemy.width &&
                    enemy.x + enemy.width > otherEnemy.x &&
                    enemy.y < otherEnemy.y + otherEnemy.height &&
                    enemy.y + enemy.height > otherEnemy.y) {
                    // 충돌 발생 시 속도 차이를 둠
                    collisionDetected = true;
                    if (enemy.speed === otherEnemy.speed) {
                        enemy.speed -= 0.5;
                    }
                }
            });

            // 충돌이 없을 경우 속도를 원래대로 복원
            if (!collisionDetected) {
                enemy.speed = 2;
            }
        });
    }

    // 플레이어와 적의 충돌을 확인하는 함수
    function checkCollisions() {
        enemies.forEach(enemy => {
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                // 충돌 감지
                // console.log('충돌!');
                // 플레이어의 hp 감소 (최대 1초에 한 번)
                if (!enemy.lastCollisionTime || Date.now() - enemy.lastCollisionTime > 1000) {
                    player.hp -= 1;
                    enemy.lastCollisionTime = Date.now();
                    if (player.hp <= 0) {
                        gameOver();
                    }
                }
            }
        });
    }

    // 새로운 적을 생성하는 함수
    function spawnEnemy() {
        const spawnDistance = 400;
        const spawnPosition = Math.random() * 4;
        let x, y;

        // 적의 생성 위치를 랜덤하게 설정
        if (spawnPosition < 1) {
            x = player.x - spawnDistance;
            y = player.y + (Math.random() * 4000 - spawnDistance);
        } else if (spawnPosition < 2) {
            x = player.x + spawnDistance;
            y = player.y + (Math.random() * 4000 - spawnDistance);
        } else if (spawnPosition < 3) {
            x = player.x + (Math.random() * 4000 - spawnDistance);
            y = player.y - spawnDistance;
        } else {
            x = player.x + (Math.random() * 4000 - spawnDistance);
            y = player.y + spawnDistance;
        }

        // 적 객체를 배열에 추가
        enemies.push({ x, y, width: 30, height: 50, speed: 2, hp: 4, maxHp: 4 }); // 적의 hp 속성 추가
    }

    // 투사체를 생성하는 함수
    function spawnProjectile() {
        if (enemies.length === 0) return;

        // 가장 가까운 적 찾기
        let closestEnemy = enemies[0];
        let minDistance = Math.hypot(player.x - closestEnemy.x, player.y - closestEnemy.y);

        enemies.forEach(enemy => {
            const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (distance < minDistance) {
                closestEnemy = enemy;
                minDistance = distance;
            }
        });

        // 투사체 생성
        const angle = Math.atan2(closestEnemy.y - player.y, closestEnemy.x - player.x);
        projectiles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            width: 10,
            height: 10,
            speed: 10,
            angle: angle
        });
    }

    // 투사체의 위치를 업데이트하는 함수
    function updateProjectiles() {
        projectiles.forEach((projectile, index) => {
            projectile.x += projectile.speed * Math.cos(projectile.angle);
            projectile.y += projectile.speed * Math.sin(projectile.angle);

            // 적과의 충돌 확인
            enemies.forEach((enemy, enemyIndex) => {
                if (projectile.x < enemy.x + enemy.width &&
                    projectile.x + projectile.width > enemy.x &&
                    projectile.y < enemy.y + enemy.height &&
                    projectile.y + projectile.height > enemy.y) {
                    // 충돌 시 투사체 제거 및 적의 hp 감소
                    projectiles.splice(index, 1);
                    enemy.hp -= 2;
                    if (enemy.hp <= 0) {
                        enemies.splice(enemyIndex, 1);
                    }
                }
            });
        });
    }

    let isPaused = false;
    let enemySpawnInterval;
    let projectileSpawnInterval;

    // 키 입력 상태를 저장하는 객체
    const keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === pauseKey) {
            togglePause();
        }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // 일시정지 상태를 토글하는 함수
    function togglePause() {
        isPaused = !isPaused;
        const gameContainer = document.getElementById('gameContainer');
        const pauseMenu = document.getElementById('pauseMenu');
        if (isPaused) {
            clearInterval(enemySpawnInterval); // 적 생성 일시정지
            clearInterval(projectileSpawnInterval); // 투사체 생성 일시정지
            gameContainer.classList.add('paused');
            pauseMenu.classList.remove('hidden');
        } else {
            enemySpawnInterval = setInterval(spawnEnemy, 1000); // 적 생성 재개
            projectileSpawnInterval = setInterval(spawnProjectile, 1000); // 투사체 생성 재개
            gameContainer.classList.remove('paused');
            pauseMenu.classList.add('hidden');
            gameLoop(); // 게임 루프 재개
        }
    }

    // 게임 오버 함수
    function gameOver() {
        isGameOver = true;
        isPaused = true;
        clearInterval(enemySpawnInterval);
        clearInterval(projectileSpawnInterval);
        document.getElementById('gameContainer').classList.add('paused');
        document.getElementById('gameOverMenu').classList.remove('hidden');
    }

    // 게임 상태 초기화 함수
    function resetGame() {
        player.x = 2500;
        player.y = 2500;
        player.hp = 10; // 플레이어의 hp 초기화
        player.maxHp = 10;
        enemies.length = 0;
        projectiles.length = 0; // 투사체 배열 초기화
        isPaused = false;
        isGameOver = false;
        document.getElementById('gameContainer').classList.remove('paused');
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('gameOverMenu').classList.add('hidden');
        clearInterval(enemySpawnInterval);
        clearInterval(projectileSpawnInterval);
        enemySpawnInterval = setInterval(spawnEnemy, 1000);
        projectileSpawnInterval = setInterval(spawnProjectile, 1000);
        gameLoop();
    }

    // 초기화 버튼 클릭 이벤트
    document.getElementById('resetButton').addEventListener('click', resetGame);

    // 다시하기 버튼 클릭 이벤트
    document.getElementById('retryButton').addEventListener('click', resetGame);

    // 재개 버튼 클릭 이벤트
    document.getElementById('resumeButton').addEventListener('click', () => {
        togglePause();
    });

    // 카메라의 위치를 업데이트하는 함수
    function updateCamera() {
        camera.x = player.x - viewport.width / 2;
        camera.y = player.y - viewport.height / 2;
    }

    // 게임 루프 함수
    function gameLoop() {
        if (isPaused || isGameOver) return; // 일시정지 또는 게임 오버 상태에서는 업데이트 중지

        // 캔버스를 지움
        ctx.clearRect(0, 0, viewport.width, viewport.height);

        // 게임 상태 업데이트
        updatePlayer();
        updateEnemies();
        updateProjectiles(); // 투사체 업데이트
        checkCollisions();
        updateCamera();

        // 게임 객체 그리기
        drawPlayer();
        drawEnemies();
        drawProjectiles(); // 투사체 그리기

        // 다음 프레임 요청
        requestAnimationFrame(gameLoop);
    }

    // 게임 루프 시작
    gameLoop();

    // 매 초마다 적 생성 및 투사체 생성
    enemySpawnInterval = setInterval(spawnEnemy, 500);
    projectileSpawnInterval = setInterval(spawnProjectile, 500);
};
