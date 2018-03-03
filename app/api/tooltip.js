import R from 'ramda';
import { Clipboard } from 'react-native';
export function copyVerse(selectVerse) {
  const copyText = generateCopyText(selectVerse);
  Clipboard.setString(copyText);
  return copyText;
}
export async function checkBookmark(selectVerse) {
  try {
    const bookmark = await global.storage.load({key:'@bookmark'});
    const matchFn = R.contains(R.__, R.keys(bookmark)); 
    const isMatch = R.all(matchFn)(R.keys(selectVerse));
    return isMatch;
  } catch(e) {
    alert(JSON.stringify(e));
  }
}
export async function addBookmark(action, selectVerse) {
  try {
    if (action) {
      const _bookmark = await global.storage.load({key:'@bookmark'});
      R.keys(selectVerse).map((keyId) => {
        delete _bookmark[keyId];
      });
      await global.storage.save({key: '@bookmark', data: _bookmark, expires: null});
    } else {
      const bookmark = await global.storage.load({key:'@bookmark'});
      const _bookmark = {
        ...bookmark,
        ...selectVerse,
      }
      await global.storage.save({key: '@bookmark', data: _bookmark, expires: null});
    }
  } catch(e) {
    alert(JSON.stringify(e));
  }
}
export async function setHighlight(data) {
  const {color, selectVerse, selectVerseRef, selectVerseNumberRef, fontColor} = data;
  try {
    const selectVerses = R.keys(selectVerse);
    const setColorList = selectVerses.reduce((acc, val) => {
      return {
        ...acc,
        [val]: color,
      };
    }, {});
    const highlightList = await global.storage.load({key:'@highlightList'});
    const _highlightList = {
      ...highlightList,
      ...setColorList,
    }
    await global.storage.save({key: '@highlightList', data: _highlightList, expires: null});
    R.values(selectVerseNumberRef).map(item => item.setNativeProps({style:{color:fontColor, backgroundColor:color,textDecorationLine:'none', textDecorationStyle:'dotted'}}));
    R.values(selectVerseRef).map(item => item.setNativeProps({style:{color:fontColor, backgroundColor:color, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
  } catch(e) {
    alert(JSON.stringify(e));
  }
}
function generateCopyText(selectVerse) {
    let c = 0;
    const verse = R.pipe(
      R.toPairs(),
      R.sort((a, b) => {
        let _a = a[0];
        let _b = b[0];
        _a = Number(_a.slice(0, _a.indexOf('-')));
        _b = Number(_b.slice(0, _b.indexOf('-')));
        return _a - _b;
        }
      ),
      R.fromPairs(),
      R.values(),
    )(selectVerse);
    const copy = verse.reduce((acc, val, i) => {
      let b = [];
      const previousVerse = verse[i - 1];
      if(i == 0){
        b.push(val);
        acc[c] = b;
        return acc;
      }
      if(previousVerse.book_name == val.book_name && previousVerse.chapter_nr == val.chapter_nr && previousVerse.verse_nr == val.verse_nr -1){
        acc[c].push(val);
        return [...acc];
      }
      ++c;
      b.push(val);
      acc[c] = b;
      return  [...acc];
    }, []);
    const copyText = copy.reduce((acc, val) => {
      let verseNumber = '';
      verseNumber = (val.length == 1) ? '' : '-' + (val[0].verse_nr + val.length - 1);
      for(let i = 0; i < val.length; i++){
        if(i == 0){
          acc = acc + val[0].book_name + val[0].chapter_nr + ':' + val[0].verse_nr + verseNumber + '  :『' + val[i].verse;
        } else {
          acc = acc  + val[i].verse;
        }
      }
      acc = acc + '』\n\n';
      return acc;
    }, '');
    return copyText;
  }