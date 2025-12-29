import ngrok from 'ngrok';

(async function () {
    try {
        await ngrok.kill();

        const url = await ngrok.connect({
            authtoken: '32x5qrhXi35kLkPH35oTr2OEAva_6JdSSeTuMLQyZuWBYCWc3', // <--- BU YERGA O'Z TOKENINGIZNI QO'YING (ALBATTA!)
            addr: 5050,
            domain: 'cataractal-unperiphrastic-catherina.ngrok-free.dev', // 'hostname' emas 'domain'
        });

        console.log('\n\x1b[32m%s\x1b[0m', '===========================================');
        console.log(`🚀 GLOBAL URL: \x1b[36m${url}\x1b[0m`);
        console.log('\x1b[32m%s\x1b[0m', '===========================================');

    } catch (err) {
        console.error('❌ Ngrok ulanmadi!');
        console.error('Sabab:', err.message);
    }
})();