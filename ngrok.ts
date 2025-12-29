import ngrok from 'ngrok';

(async function () {
    try {
        const url = await ngrok.connect({
            addr: 5050,
            subdomain: 'cataractal-unperiphrastic-catherina',
        });

        console.log('-------------------------------------------');
        console.log(`🚀 Global URL: \x1b[36m${url}\x1b[0m`);
        console.log('-------------------------------------------');
    } catch (err) {
        console.error('Error while connecting ngrok', err);
    }
})();