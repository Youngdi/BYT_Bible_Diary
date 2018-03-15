import Realm from 'realm';
const bible_chs = {
  name: 'bible_chs',
  primaryKey: 'id',
  properties: {
    id: 'int',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?',
    highlight_color: 'string?'
  }
}
const bible_cht = {
  name: 'bible_cht',
  primaryKey: 'id',
  properties: {
    id: 'int',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?',
    highlight_color: 'string?'
  }
}
const bible_japan = {
  name: 'bible_japan',
  primaryKey: 'id',
  properties: {
    id: 'int',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?',
    highlight_color: 'string?'
  }
}
const bible_kjv = {
  name: 'bible_kjv',
  primaryKey: 'id',
  properties: {
    id: 'int',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?',
    highlight_color: 'string?'
  }
}
const schedule = {
  name: 'schedule',
  primaryKey: 'id',
  properties: {
    id: 'int?',
    month: 'int?',
    day: 'int?',
    book_id: 'int?',
    chapter_from: 'int?',
    verse_from: 'int?',
    chapter_to: 'int?',
    verse_to: 'int?'
  }
}

export function test_db() {
  return new Promise((resolve, reject) => {
    Realm.open({
      path: 'byt.realm',
      schema:[schedule],
      schemaVersion: 13,
    }).then(realm => {
      const realm_schedule = realm.objects('schedule');
      const schedule_results = realm_schedule.filtered(`month = 1 AND day = 1`);
      resolve(schedule_results);
      setTimeout(() => {
        realm.close();
      }, 0);
    }).catch(e => console.log(e));
  });
}
export function dbCustomizeSearch(query, lang){
  let schema;
  if(lang == 'cht') schema = [bible_cht];
  if(lang == 'chs') schema = [bible_chs];
  if(lang == 'en')  schema = [bible_kjv];
  if(lang == 'ja')  schema = [bible_japan];
  return new Promise((resolve, reject) => {
    Realm.open({
      path: 'byt.realm',
      schema: schema,
      schemaVersion: 13,
    }).then(realm => {
      let realmBibleVersion;
      if(lang == 'cht') realmBibleVersion = realm.objects('bible_cht');
      if(lang == 'chs') realmBibleVersion = realm.objects('bible_chs');
      if(lang == 'en') realmBibleVersion = realm.objects('bible_kjv');
      if(lang == 'ja') realmBibleVersion = realm.objects('bible_japan');
      const rawResults = realmBibleVersion.filtered(query);
      const results = rawResults.map(item => Object.assign({}, item));
      realm.close();
      setTimeout(() => {
        resolve(results);
      }, 0);
    }).catch(e => console.log(e));
  });
}
export function dbGetBookContent(book_nr, chapter_nr, lang) {
  let schema;
  if(lang == 'cht') schema = [bible_cht];
  if(lang == 'chs') schema = [bible_chs];
  if(lang == 'en')  schema = [bible_kjv];
  if(lang == 'ja')  schema = [bible_japan];
  return new Promise((resolve, reject) => {
    Realm.open({
      path: 'byt.realm',
      schema: schema,
      schemaVersion: 13,
    }).then(realm => {
      let realmBibleVersion;
      if(lang == 'cht') realmBibleVersion = realm.objects('bible_cht');
      if(lang == 'chs') realmBibleVersion = realm.objects('bible_chs');
      if(lang == 'en') realmBibleVersion = realm.objects('bible_kjv');
      if(lang == 'ja') realmBibleVersion = realm.objects('bible_japan');
      const rawResults = realmBibleVersion.filtered(`book_nr = ${book_nr} AND chapter_nr = ${chapter_nr}`);
      const rawResults_length = realmBibleVersion.filtered(`book_nr = ${book_nr}`);
      const sortedResults = rawResults.sorted('verse_nr', false)
      const results = sortedResults.map(item => Object.assign({}, item));
      const results_findLength = rawResults_length.map(item => Object.assign({}, item));
      realm.close();
      setTimeout(() => {
        resolve({results_findLength: results_findLength, content: results});
      }, 0);
    }).catch(e => console.log(e));
  });
}
export function dbFindChapter(book_nr, lang) {
  let schema;
  if(lang == 'cht') schema = [bible_cht];
  if(lang == 'chs') schema = [bible_chs];
  if(lang == 'en')  schema = [bible_kjv];
  if(lang == 'ja')  schema = [bible_japan];
  return new Promise((resolve, reject) => {
    Realm.open({
      path: 'byt.realm',
      schema: schema,
      schemaVersion: 13,
    }).then(realm => {
      let realmBibleVersion;
      if(lang == 'cht') realmBibleVersion = realm.objects('bible_cht');
      if(lang == 'chs') realmBibleVersion = realm.objects('bible_chs');
      if(lang == 'en') realmBibleVersion = realm.objects('bible_kjv');
      if(lang == 'ja') realmBibleVersion = realm.objects('bible_japan');
      const rawResults = realmBibleVersion.filtered(`book_nr = ${book_nr}`);
      const results = rawResults.map(item => Object.assign({}, item));
      realm.close();
      setTimeout(() => {
        resolve(results);
      }, 0);
    }).catch(e => console.log(e));
  });
}
export function dbFindVerse(book_nr, chapter_nr, lang) {
  let schema;
  if(lang == 'cht') schema = [bible_cht];
  if(lang == 'chs') schema = [bible_chs];
  if(lang == 'en')  schema = [bible_kjv];
  if(lang == 'ja')  schema = [bible_japan];
  return new Promise((resolve, reject) => {
    Realm.open({
      path: 'byt.realm',
      schema: schema,
      schemaVersion: 13,
    }).then(realm => {
      let realmBibleVersion;
      if(lang == 'cht') realmBibleVersion = realm.objects('bible_cht');
      if(lang == 'chs') realmBibleVersion = realm.objects('bible_chs');
      if(lang == 'en') realmBibleVersion = realm.objects('bible_kjv');
      if(lang == 'ja') realmBibleVersion = realm.objects('bible_japan');
      const rawResults = realmBibleVersion.filtered(`book_nr = ${book_nr} AND chapter_nr = ${chapter_nr}`);
      const sortedResults = rawResults.sorted('verse_nr', false)
      const results = sortedResults.map(item => Object.assign({}, item));
      realm.close();
      setTimeout(() => {
        resolve(results);
      }, 0);
    }).catch(e => console.log(e));
  });
}
export function dbFindDiary(date, lang = 'cht') {
  let schema;
  if(lang == 'cht') schema = [bible_cht];
  if(lang == 'chs') schema = [bible_chs];
  if(lang == 'en')  schema = [bible_kjv];
  if(lang == 'ja')  schema = [bible_japan];
  return new Promise((resolve, reject) => {
    Realm.open({
      path: 'byt.realm',
      schema:[schedule, ...schema],
      schemaVersion: 13,
    }).then(realm => {
      const { month, day}  = date;
      let realmBibleVersion;
      const realm_schedule = realm.objects('schedule');
      if(lang == 'cht') realmBibleVersion = realm.objects('bible_cht');
      if(lang == 'chs') realmBibleVersion = realm.objects('bible_chs');
      if(lang == 'en') realmBibleVersion = realm.objects('bible_kjv');
      if(lang == 'ja') realmBibleVersion = realm.objects('bible_japan');
      const schedule_results = realm_schedule.filtered(`month = ${month} AND day = ${day}`);
      const schedule_result_reorder = schedule_results.sorted('book_id', false);
      const _schedule_results = schedule_result_reorder.reduce((acc, val) => {
        let _acc = acc;
        let _val = val;
        if(val.chapter_from == val.chapter_to) return [...acc, val];
        for(let i = 0; i <= val.chapter_to - val.chapter_from; i++) {
          _val = {..._val, chapter_from: val.chapter_from + i, chapter_to: val.chapter_from + i}
          _acc = [..._acc, _val];
        }
        return _acc;
      }, []);
      const content = _schedule_results.map(item => {
        let results;
        if(item.verse_from == 0 && item.verse_to == 0) {
          results = realmBibleVersion.filtered(`book_nr = ${item.book_id} AND chapter_nr = ${item.chapter_from} AND verse_nr >= ${item.verse_from} AND verse_nr <= 200`);
        } else if (item.verse_from != 0 && item.verse_to == 0) {
          results = realmBibleVersion.filtered(`book_nr = ${item.book_id} AND chapter_nr = ${item.chapter_from} AND verse_nr = ${item.verse_from}`);
        } else {
          results = realmBibleVersion.filtered(`book_nr = ${item.book_id} AND chapter_nr = ${item.chapter_from} AND verse_nr >= ${item.verse_from} AND verse_nr <= ${item.verse_to}`);
        }
        const resultsSorted = results.sorted('verse_nr', false);
        return finalResults = resultsSorted.map(item => Object.assign({}, item));
      });
      if(lang == 'cht_en') {
        const jContent = _schedule_results.map(item => {
          const results = realm_bible_kjv.filtered(`book_nr = ${item.book_id} AND chapter_nr >= ${item.chapter_from} AND chapter_nr <= ${item.chapter_to} AND verse_nr >= ${item.verse_from} AND verse_nr <= ${item.verse_to == 0 ? 200 : item.verse_to}`);
          return results.sorted('verse_nr', false);
        });
        const bindContent = jContent.reduce((acc, val, i) => {
          const zipContent = R.zip(content[i], val);
          return [...acc, R.flatten(zipContent)];
        }, []).map(item => Object.assign({}, item));
        resolve(bindContent);
      } else {
        resolve(content);
      }
      setTimeout(() => {
        realm.close();
      }, 100);
    }).catch(e => console.log(e));
  });
}
// export async function api_login(value) {
//   let response = await fetch(
//     `https://${Config.SERVER_IP}:${Config.PORT}/login`,
//     {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json',
//     },
//       body: JSON.stringify({
//         'username': value.username,
//         'password': value.password
//       })
//     }
//   )
//   .then((response) => response.json())
//   .catch((error) => {
//     alert('不好意思，伺服器已關閉，明年請儘早報名變強好不好夏令營');
//     console.error(error);
//     return error;
//   });
//   return response;
// }
// export async function getLand() {
//     let response = await fetch(`https://${Config.SERVER_IP}:${Config.PORT}/get_map`,)
//     .then((response) => response.json())
//     .catch((error) => {
//       console.error(error);
//       return error;
//     });
//     return response;
// }
