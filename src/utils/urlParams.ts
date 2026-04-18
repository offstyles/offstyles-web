import { Style } from "@/types/Style";
const update = function(name: string, value : number | string) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, String(value));
  if(name === 'style' && value === Style.all){
    params.delete(name);
  }
  if(name === 'style') {
    params.delete('page');
  }
  //cant use router outside of setup component, so need to return the new query and use there instead
  return Object.fromEntries(params)
};

const get = function(){
  const params = new URLSearchParams(window.location.search);
  return params.toString();
}

const getAsObject = function(){
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params)
}

const clearPage = function() {
  const params = new URLSearchParams(window.location.search);
  params.delete('page');
  return Object.fromEntries(params)
}

const updateMany = function(updates: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(updates)) {
    // Style.all is the implicit default — keep it out of the URL so shared links stay clean.
    if (value === undefined || (key === 'style' && value === Style.all)) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  params.delete('page');
  return Object.fromEntries(params);
};

export default {update, get, getAsObject, clearPage, updateMany};
