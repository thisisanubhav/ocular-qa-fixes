// Catalogue snapshot from useocular.com, 18 October 2026.
const entries = [
  ['American English','English','United States','american-english','US'],
  ['French','French','France · Belgium · Canada','french','FR'],
  ['Mandarin','Chinese Mandarin','China · Taiwan','mandarin','CN'],
  ['Spanish','Spanish','Spain · Mexico · Colombia · Argentina','spanish','ES'],
  ['Vietnamese','Vietnamese','Vietnam','vietnamese','VN'],
  ['Indonesian','Indonesian','Indonesia','indonesian','ID'],
  ['Hindi','Hindi','India','hindi','IN'],
  ['Arabic','Arabic','Arabic-speaking regions','arabic','AR'],
  ['German','German','Germany','german','DE'],
  ['Japanese','Japanese','Japan','japanese','JP'],
  ['Korean','Korean','South Korea','korean','KR'],
  ['Polish','Polish','Poland','polish','PL'],
  ['Russian','Russian','Russian-speaking regions','russian','RU'],
  ['Thai','Thai','Thailand','thai','TH'],
];
export const datasets = entries.map(([name,language,countries,slug,code]) => ({
  name: `${name} Full-Duplex Conversational Dataset`, language, countries,
  slug: `${slug}-full-duplex`, code,
  description: `Natural ${name} conversations with two speakers. Full-duplex recordings preserve overlap, timing, and the details of everyday speech.`,
}));
export const products = [
  {slug:'proprietary',name:'Proprietary Datasets',eyebrow:'Built for your model',description:'Define the language, domain, and task. Build a dataset around the capabilities you need to develop.'},
  {slug:'hi-fi',name:'Hi-Fi, Studio-Grade',subject:'Hi-Fi, Studio-Grade datasets',eyebrow:'Every detail matters',description:'High-fidelity speech for models that need to hear more than words. Explore studio-grade conversational recordings.'},
  {slug:'tts-voices',name:'Voice Actors, TTS',subject:'Voice Actors, TTS datasets',eyebrow:'A voice with character',description:'Explore voice data for expressive text-to-speech, with professional delivery and the nuance of human speech.'},
  {slug:'audiovisual',name:'Full-Duplex Audiovisual',subject:'Full-Duplex Audiovisual datasets',eyebrow:'See the whole conversation',description:'Bring speech and visual signals together to study the timing, expressions, and context of conversation.'},
  {slug:'open-source',name:'Open Source',eyebrow:'Research in the open',description:'Explore Ocular’s publicly available datasets and research resources for conversational AI.'},
];
export const navGroups = [
 {name:'Research & Evals',links:[['Research Index','/research'],['Converse Benchmarks','/converse'],['Converse-Diarization','/converse/diarization'],['Converse-STT','/converse/stt']]},
 {name:'Products',links:[['All Products','/products'],['Off-the-shelf Data','/human-data/marketplace'],...products.map(p=>[p.name,`/human-data/${p.slug}`])]},
 {name:'Experts',links:[['Expert Network','/experts'],['Find Work ↗','https://workbolt.ai/public-jobs']]},
 {name:'Company',links:[['About Ocular','/company'],['Careers','/careers'],['Contact','/contact']]},
];
export const interests=['Request a Custom Dataset','Browse our Off-the-shelf Datasets','Benchmarking AI Models','Evaluations','Add a Model to a Benchmark','Research Collaboration','Other'];
export const useCases=['Pre-training','Post-training','STT (Speech-to-Text)','TTS (Text-to-Speech)','ASR (Automatic Speech Recognition)','Other'];
export const research=[
 ['Introducing the Converse-Diarization Benchmark','Oct 13, 2026','/converse/diarization','Benchmark'],
 ['Introducing the Converse-STT Benchmark','Sep 21, 2026','/converse/stt','Benchmark'],
 ['Converse: evaluating conversational voice AI','Sep 20, 2026','/converse','Research'],
];
