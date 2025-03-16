window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

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
        width: 50,
        height: 50,
        speed: 5
    };

    // 적 객체 배열
    const enemies = [];

    // 카메라 객체 설정
    const camera = {
        x: player.x - viewport.width / 2,
        y: player.y - viewport.height / 2
    };

    // 플레이어를 그리는 함수
    function drawPlayer() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
    }

    // 적을 그리는 함수
    function drawEnemies() {
        ctx.fillStyle = 'red';
        enemies.forEach(enemy => {
            ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
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
        enemies.forEach(enemy => {
            if (player.x < enemy.x) enemy.x -= enemy.speed; // 플레이어를 향해 왼쪽으로 이동
            if (player.x > enemy.x) enemy.x += enemy.speed; // 플레이어를 향해 오른쪽으로 이동
            if (player.y < enemy.y) enemy.y -= enemy.speed; // 플레이어를 향해 위로 이동
            if (player.y > enemy.y) enemy.y += enemy.speed; // 플레이어를 향해 아래로 이동
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
                console.log('충돌!');
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
        enemies.push({ x, y, width: 50, height: 50, speed: 2 });
    }

    // 키 입력 상태를 저장하는 객체
    const keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // 카메라의 위치를 업데이트하는 함수
    function updateCamera() {
        camera.x = player.x - viewport.width / 2;
        camera.y = player.y - viewport.height / 2;
    }

    // 게임 루프 함수
    function gameLoop() {
        // 캔버스를 지움
        ctx.clearRect(0, 0, viewport.width, viewport.height);

        // 게임 상태 업데이트
        updatePlayer();
        updateEnemies();
        checkCollisions();
        updateCamera();

        // 게임 객체 그리기
        drawPlayer();
        drawEnemies();

        // 다음 프레임 요청
        requestAnimationFrame(gameLoop);
    }

    // 게임 루프 시작
    gameLoop();

    // 매 초마다 적 생성
    setInterval(spawnEnemy, 1000);
};
