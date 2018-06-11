import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx'

/*
  Generated class for the JsonReaderProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class JsonReaderProvider {
  pathToFormulaJson = '../../assets/data/expression.json'

  constructor(public http: HttpClient) {
    console.log('Hello JsonReaderProvider Provider');
  }

  readFileData(completionHeader) {
    let fileData = this.http.get(this.pathToFormulaJson, { responseType: 'json' })
    .map((response :Response)=> {
      console.log('response: ', response)
      completionHeader(response)
    })
    .subscribe(data => {
      console.log('Success: ', data)
    },
    (rej) => {
      console.log('unable to load file: ', rej)
    })  
  }

}
