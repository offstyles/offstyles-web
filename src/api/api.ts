class Api {
  static url = '';
  static async fetchFromUrl(handleErrors = true){
    try {
      const response = await fetch(this.url);
      return await response.json();
    } catch(error){
      if(!handleErrors){
        throw error;
      }
      return [];
    }
  }
}

export default Api;