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
  //for testing purposes
  static async fakeFetch(data : any){
    await new Promise(resolve => setTimeout(resolve, 1500));
    return data;
  }
}

export default Api;