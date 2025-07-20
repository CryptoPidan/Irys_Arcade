const { Uploader } = require("@irys/upload");
const { Ethereum } = require("@irys/upload-ethereum");

async function submitScore(privateKey,proxy) {
    process.env.GLOBAL_AGENT_HTTP_PROXY =`${proxy}`;
    require('global-agent/bootstrap');
    const irysUploader = await Uploader(Ethereum).withWallet(privateKey);
    const walletAddress=irysUploader.address;
    try {
        const gameId = "snake";
        const score = 10 + Math.floor(Math.random() * 6);
        const scoreData = {
            game: gameId,
            score: score,
            date: new Date().toISOString()
        };
        const dataToUpload = JSON.stringify(scoreData);

        const tags = [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Application-Id', value: 'Irys-Arcade' },
            { name: 'Score-Entry', value: 'true' },
            { name: 'Game-Name', value: gameId },
            { name: 'Player-Wallet', value: walletAddress },
            { name: 'Player-Name', value: walletAddress.slice(0, 8) + '...' + walletAddress.slice(-4) },
            { name: 'Score', value: score.toString() },
            { name: 'Game-Version', value: '1.0' },
            { name: 'Timestamp', value: Date.now().toString() }
        ];
        const receipt = await irysUploader.upload(dataToUpload, { tags: tags });
        if (receipt && receipt.id) {
            console.log(`✅ Submit address: ${walletAddress}`);
            console.log(`✅ Submit score: ${dataToUpload}`);
            console.log(`✅ Submit successfully: https://gateway.irys.xyz/${receipt.id}`);
            return true;
        } else {
            console.error(`❌ Error:`, receipt);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error ${walletAddress}:`, error.message);
        return false;
    }
}

(async () => {
    const fs = require('fs');
    const privateKeys = fs.readFileSync('privateKeys.txt', 'utf-8').trim().split('\n').map(proxy => proxy.trim()).filter(proxy => proxy !== '');
    const proxies = fs.readFileSync('proxies.txt', 'utf-8').trim().split('\n').map(proxy => proxy.trim()).filter(proxy => proxy !== '');
    if( privateKeys.length !== proxies.length) {
        console.error("❌ 错误: 私钥和代理数量不匹配");
        return;
    }
    if( privateKeys.length === 0 || proxies.length === 0) {
        console.error("❌ 错误: 私钥或代理列表为空");
        return;
    }
    for (let i = 0; i < privateKeys.length && i < proxies.length; i++) {
        for (let j = 0; j < 1000; j++) {
            console.log(`🚀 账号 ${i + 1} 第 ${j + 1} 次提交`);
            await submitScore(privateKeys[i], proxies[i]);
        }
    }
})();