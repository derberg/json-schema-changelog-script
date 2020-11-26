const json2html = require('node-json2html');

module.exports = { getHtmlTable, sortResultsByPullNo };

function getHtmlTable(data) {
  const defaultContent=`
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mx-auto px-4">
                <p>
                    <table class="shadow-lg bg-white">
                        <thead class="justify-between">
                            <tr>
                                <th class="bg-blue-100 border text-left px-8 py-4">Date</th>
                                <th class="bg-blue-100 border text-left px-8 py-4">Author</th>
                                <th class="bg-blue-100 border text-left px-8 py-4">Message</th>
                                <th class="bg-blue-100 border text-left px-8 py-4">Commit URL</th>
                                <th class="bg-blue-100 border text-left px-8 py-4">Pull Request?</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white">{{here}}</tbody>
                    </table>
                </p>
            </div>
        </body>
    </html>`;

  const transformer= {
    tag: 'tr',
    class: 'px-8 py-4 border-b border-gray-500',
    children: [{
      tag: 'td',
      class: 'w-18 text-center',
      html: '${date}'
    }, {
      tag: 'td',
      class: 'w-38 border-l',
      html: '${author}'
    }, {
      tag: 'td',
      class: 'border-l',
      html: '${message}'
    }, {
      tag: 'td',
      class: 'w-16 text-center border-l',
      children: [{
        tag: 'a',
        target: '_blank',
        class: 'underline text-blue-500',
        html: 'click here',
        href: '${commitUrl}'
      }]
    }, {
      tag: 'td',
      class: 'w-18 text-center border-l',
      children: [{
        tag: 'a',
        target: '_blank',
        class: 'underline text-blue-500',
        html: '${pullNo}',
        href: '${pullUrl}'
      }]
    }]
  };

  const htmlFromData = json2html.transform(data, transformer);
  return defaultContent.replace('{{here}}', htmlFromData);
}

function sortResultsByPullNo(arr) {
  return arr.sort((a,b) => {
    if (!a.pullNo || !b.pullNo) return 1;
    return a.pullNo - b.pullNo;
  });
}