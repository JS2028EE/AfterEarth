const KEY='afterearth-save-v1';
export function saveGame(state){localStorage.setItem(KEY,JSON.stringify({...state,savedAt:new Date().toISOString()}));return true}
export function loadGame(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
export function clearSave(){localStorage.removeItem(KEY)}
