const path = require('path');
const fs = require('fs-extra');
const ora = require('ora');
const { parseComponentType } = require('./parse');

const spinner = ora();
const componentsDir = path.join(__dirname, '../ant-design/components');

const filterFolders = ['__tests__', '_util'];

const fetchComponent = async componentName => {
  const componentPath = path.join(componentsDir, componentName);
  const demoPath = path.join(componentPath, 'demo');
  const demoIndexCNFilePath = path.join(componentPath, 'index.zh-CN.md');
  let demoFiles = [];
  try {
    let componentType = '';
    if (componentName === 'table') {
      componentType = '表格';
    } else if (componentName === 'form') {
      componentType = '表单';
    } else {
      const demoIndexCNFileText = await fs.readFile(
        demoIndexCNFilePath,
        'utf8'
      );
      componentType = parseComponentType(demoIndexCNFileText);
    }

    const fileNames = await fs.readdir(demoPath);
    demoFiles = fileNames
      .filter(fileName => path.extname(fileName) === '.md')
      .map(mdFileName => {
        const mdBaseName = path.basename(mdFileName, '.md');
        const fileName = `${componentName}-${mdBaseName}`;
        const filePath = path.join(demoPath, mdFileName);
        return {
          componentName,
          mdBaseName,
          name: fileName,
          filePath,
          componentType
        };
      });
  } catch (err) {}
  return demoFiles;
};

const fetchAntDDemos = async () => {
  spinner.start('fetch antd demos');
  const fileNames = await fs.readdir(componentsDir);
  const componentNames = fileNames.filter(fileName => {
    const filePath = path.join(componentsDir, fileName);
    return (
      !filterFolders.includes(fileName) && fs.statSync(filePath).isDirectory()
    );
  });
  let demos = [];
  await Promise.all(
    componentNames.map(async name => {
      const result = await fetchComponent(name);
      demos = demos.concat(result);
    })
  );
  return demos;
};

module.exports = fetchAntDDemos;
