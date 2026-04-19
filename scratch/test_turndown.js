const TurndownService = require('turndown');
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

const html = `<pre><code class="language-javascript">const x = 10;\nconsole.log(x);</code></pre>`;
console.log('--- Result ---');
console.log(turndownService.turndown(html));
console.log('--------------');
