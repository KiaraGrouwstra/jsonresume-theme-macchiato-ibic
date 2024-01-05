const fs = require('fs');
const handlebars = require('handlebars');
const handlebarsWax = require('handlebars-wax');
// const addressFormat = require('address-format');
const moment = require('moment');
const Swag = require('swag');
const _ = require('underscore');
const markdown = require('markdown-it')({
  breaks: true,
}).use(require('markdown-it-abbr'));

try {
  window.Swag.registerHelpers(handlebars);
} catch (e) {
  Swag.registerHelpers(handlebars);
}

handlebars.registerHelper({
  removeProtocol: url => url.replace(/.*?:\/\//g, ''),
  concat: (...args) => args.filter(arg => typeof arg !== 'object').join(''),
  // Arguments: {address, city, subdivision, postalCode, countryCode}
  // formatAddress: (...args) => addressFormat(args).join(' '),
  formatAddress: (...args) => args.filter(arg => typeof arg !== 'object').join(' '),
  formatDate: date => moment(date).format('MM/YYYY'),
  // lowercase: s => s.toLowerCas(),
});

function convertMarkdown(str) {
  if (str != null) {
    return markdown.render(str);
  }
  return null;
}

function render(resume) {
  const dir = `${__dirname}/src`;
  const css = fs.readFileSync(`${dir}/style.css`, 'utf-8');
  const resumeTemplate = fs.readFileSync(`${dir}/resume.hbs`, 'utf-8');

  const Handlebars = handlebarsWax(handlebars);

  Handlebars.partials(`${dir}/partials/**/*.{hbs,js}`);

  resume.basics.summary = convertMarkdown(resume.basics.summary);
  _(resume.projects).forEach(projectInfo => {
    projectInfo.description = convertMarkdown(projectInfo.description);
    projectInfo.highlights = _(projectInfo.highlights).map(convertMarkdown);
  });
  _(resume.work).forEach(workInfo => {
    workInfo.summary = convertMarkdown(workInfo.summary);
    workInfo.highlights = _(workInfo.highlights).map(convertMarkdown);
  });
  // _(resume.skills).forEach(skillInfo => {
  //   skillInfo.keywords = _(skillInfo.keywords).map(convertMarkdown);
  // });
  _(resume.education).forEach(educationInfo => {
    educationInfo.courses = _(educationInfo.courses).map(convertMarkdown);
  });
  _(resume.awards).forEach(a => {
    a.summary = convertMarkdown(a.summary);
  });
  _(resume.volunteer).forEach(v => {
    v.summary = convertMarkdown(v.summary);
    v.highlights = _(v.highlights).map(convertMarkdown);
  });
  _(resume.publications).forEach(p => {
    p.summary = convertMarkdown(p.summary);
  });
  _(resume.references).forEach(r => {
    r.reference = convertMarkdown(r.reference);
  });

  return Handlebars.compile(resumeTemplate)({
    style: `<style>${css}</style>`,
    resume,
  });
}

const marginValue = '0.8 cm';
const pdfRenderOptions = {
  margin: {
    top: marginValue,
    bottom: marginValue,
    left: marginValue,
    right: marginValue,
  },
};

module.exports = {
  render,
  pdfRenderOptions,
};
