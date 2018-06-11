import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';
import { JsonReaderProvider } from '../../providers/json-reader/json-reader';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the AddDataPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-data',
  templateUrl: 'add-data.html',
})
export class AddDataPage {
  data = {date:"", type:"", description:"", amount:0, extra:0}
  expression: string
  constantsDictionary = {}
  jsonData = {
    "expression": "(Sum_Assured*2)+extra",
    "constants": {
        "Sum_Assured": 75000.00,
        "DIFC": 0.20,
        "Top_Up_Premium": 200
    }
}

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private sqlite: SQLite,
    private toast: Toast,
    public http: HttpClient,
    public alertCtrl: AlertController) {

    }
    
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddDataPage');
    this.expression = this.jsonData['expression']
    this.constantsDictionary = this.jsonData['constants']
    this.evaluateJsonExpression()
  }

  evaluateJsonExpression() {
    console.log('Entered evaluateJsonExpression()')
    for (var key in this.jsonData['constants']) {
      let value = this.jsonData['constants'][key]
      window[key] = value //Creating Global Variables
    }

    var searchFor = ''
    for (var i = 0; i < this.expression.length; i++) {
      let regexForConstantName = new RegExp("^[a-zA-Z_]*$")
      let currentChar = this.expression.charAt(i)
      if (regexForConstantName.test(currentChar)) {
        searchFor = searchFor + this.expression.charAt(i)
      }
      else {
          let consVal = this.searchInConstants(searchFor)
          if (consVal) {
            // Global Value already created
          }
          else {
            // Search for column name = searchFor in table  
            let columnName = searchFor.trim()
            let that = this
            console.log('LAST: Searching for: ', columnName)
            let completionBlock_ColLastValue = function (data) {
              console.log('LAST: Entered completionBlock_ColLastValue>>>')
              if (data == true) {
                // Created global variable for $colName = $columnLastValue
                let exp = that.jsonData['expression']
                var cc = eval("exp");
                that.data.extra = eval('(' + cc + ')');
                console.log('Expression-cc ', cc)
                console.log('EVALUATED EXPRESSION>> ', that.data.extra)
              }
              else {
                // JSON  not having sufficient data
                console.log('LAST: getColumnLastValue() Failed ' + columnName)
                // that.showFailurePrompt('LAST: getColumnLastValue() Failed ' + columnName)                
              }
              console.log('<<< LAST: Leaving completionBlock_ColLastValue')              
            }

            let completionBlock_SearchColName = function (data) {
              console.log('LAST: Entered completionBlock_SearchColName >>>')
              if (data == true) {
                console.log('searchForColumnName() Succeeded: ' + columnName)                
                that.getColumnLastValue(columnName, completionBlock_ColLastValue)
              }
              else {
                // JSON  not having sufficient data
                console.log('LAST: searchForColumnName() Failed ' + columnName)
                // that.showFailurePrompt('LAST: searchForColumnName() Failed ' + columnName)                
              }
              console.log('<<< LAST: Leaving completionBlock_SearchColName')
            }
            this.searchForColumnName(columnName, 'expense', completionBlock_SearchColName)          
          }
          searchFor = ''
      }
    }
    if (searchFor.length > 0) {
      let consVal = this.searchInConstants(searchFor)
          if (consVal) {
            // Global Value already created
          }
          else {
            // Search for column name = searchFor in table  
            let columnName = searchFor.trim()
            let that = this
            console.log('LAST: Searching for: ', columnName)
            let completionBlock_ColLastValue = function (data) {
              console.log('LAST: Entered completionBlock_ColLastValue>>>')
              if (data == true) {
                // Created global variable for $colName = $columnLastValue
                let exp = that.jsonData['expression']
                var cc = eval("exp");
                that.data.extra = eval('(' + cc + ')');
                console.log('Expression-cc ', cc)  
                console.log('Sum_Assured: ', eval('Sum_Assured'))
                console.log('extra: ', eval('extra'))
                console.log('EVALUATED EXPRESSION>> ', that.data.extra)
              }
              else {
                // JSON  not having sufficient data
                console.log('LAST: getColumnLastValue() Failed ' + columnName)
                // that.showFailurePrompt('LAST: getColumnLastValue() Failed ' + columnName)                
              }
              console.log('<<< LAST: Leaving completionBlock_ColLastValue')              
            }

            let completionBlock_SearchColName = function (data) {
              console.log('LAST: Entered completionBlock_SearchColName >>>')
              if (data == true) {
                console.log('searchForColumnName() Succeeded: ' + columnName)                
                that.getColumnLastValue(columnName, completionBlock_ColLastValue)
              }
              else {
                // JSON  not having sufficient data
                console.log('LAST: searchForColumnName() Failed ' + columnName)
                // that.showFailurePrompt('LAST: searchForColumnName() Failed ' + columnName)                
              }
              console.log('<<< LAST: Leaving completionBlock_SearchColName')
            }
            this.searchForColumnName(columnName, 'expense', completionBlock_SearchColName)          
          }
          searchFor = ''
    }
  }

  searchForColumnName(colName, tableName, completionBlock) {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      db.executeSql('PRAGMA table_info('+ tableName + ')', {})
      .then(res => {
        console.log('Successfuly fetched tableInfo: ', res)
        if (res.rows.length > 0) {
          for (let index = 0; index < res.rows.length; index++) {
            // console.log('item ' + index + ' : ' + res.rows.item(index).name)
            if (res.rows.item(index).name == colName) {
              console.log('Found colName: ', colName)
              completionBlock(true)
              return
            }
          }
          console.log('Not Found colName: ', colName)
          completionBlock(false)
        }
        else {
          console.log('Not Found colName: ', colName)          
          completionBlock(false)
        }
      })
      .catch(e => {
        debugger
        completionBlock(false)
        console.log('Error while fetching tableInfo: ', e)
      })
    })
  }

  getColumnLastValue(colName, completionBlock) {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {
      console.log('getColumnLastValue THEN')
      let sqlStmt = 'SELECT ' + colName + ' FROM expense WHERE rowid in (SELECT max(rowid) FROM expense)'
      console.log(sqlStmt)
      db.executeSql(sqlStmt, {})
      .then(res => {
        console.log('getColumnLastValue: ', res)
        if (res.rows.length > 0) {
          console.log('res.rows.item(0).' + colName + ' : ', res.rows.item(0)[colName])
          let colLastValue = res.rows.item(0)[colName]
          console.log(colName + ' = ' + colLastValue)
          window[colName] = colLastValue
          completionBlock(true)
        }
        else {
          window[colName] = 100
          
          completionBlock(true)
        }
      })
      .catch(e => {
        console.log('Error getColumnLastValue(): ', e)
        completionBlock(false)
      })
    })
  }

  saveData() {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {

      db.executeSql('INSERT INTO expense VALUES(NULL,?,?,?,?,?)', [this.data.date,
        this.data.type, this.data.description, this.data.amount, this.data.extra])
        .then(res => {
          console.log(res)
          this.toast.show('Data saved', '5000', 'center').subscribe(
            toast => {
              this.navCtrl.popToRoot()
            }
          )
        })
        .catch(e => {
          console.log(e)
          this.toast.show(e, '5000', 'center').subscribe(
            toast => {
              console.log(toast)
            }
          )
        })
    })
    .catch(e => {
      console.log(e)
      this.toast.show(e, '5000', 'center').subscribe(
        toast => {
          console.log(toast)
        }
      )
    })
  }

  calculateExtra() {
    let jsonReaderObj = new JsonReaderProvider(this.http)
    let that = this
    let completionHeader = function (data) {
      that.constructFormulaModel(data)
    }
    jsonReaderObj.readFileData(completionHeader)
  }

  constructFormulaModel(data) {
    if (data.expression) {
      this.expression = data.expression
      let keys = Object.keys(data.constants)
    keys.forEach(element => {
      this.constantsDictionary[element] = data.constants[element]
    });
    }
  }
  
  // evaluateExpression(extra) {
  //   let expression = this.expression
  //   let constt = this.constantsDictionary
  //   let stringyfiedConstants = JSON.stringify(this.constantsDictionary)

  //   var searchFor = ''
  //   var expressionWithValues = this.expression
  //   for (var i = 0; i < this.expression.length; i++) {
  //     let regexForConstantName = new RegExp("^[a-zA-Z_]*$")
  //     let currentChar = this.expression.charAt(i)
  //     if (regexForConstantName.test(currentChar)) {
  //       searchFor = searchFor + this.expression.charAt(i)
  //     }
  //     else {
  //         let consVal = this.searchInConstants(searchFor)
  //         if (consVal) {
  //           expressionWithValues = expressionWithValues.replace(searchFor, consVal)
  //         }
  //         else {
  //           let classLevelValue = eval.call(this, searchFor)
  //           if (classLevelValue) {
  //             expressionWithValues = expressionWithValues.replace(searchFor, classLevelValue)
  //           }
  //           else {
  //             let functionLevelValue = eval(searchFor)
  //             if (functionLevelValue != searchFor) {
  //             expressionWithValues = expressionWithValues.replace(searchFor, functionLevelValue)
  //             }
  //           }
  //         }
  //         searchFor = ''
  //     }
  //   }
  //   if (searchFor.length > 0) {
  //     let consVal = this.searchInConstants(searchFor)
  //         if (consVal) {
  //           expressionWithValues = expressionWithValues.replace(searchFor, consVal)
  //         }
  //         else {
  //           debugger
  //           let appLevelValue = eval('this.' + searchFor)
  //           if (appLevelValue) {
  //             expressionWithValues = expressionWithValues.replace(searchFor, appLevelValue)
  //           }
  //         }
  //         searchFor = ''
  //   }
  //   let evaluatedFormula = expressionWithValues
  //   let evaluatedResult = eval(expressionWithValues)
  // }

  searchInConstants(value): any {
    if (this.constantsDictionary[value]) {
      return this.constantsDictionary[value]
    }

    return null
  }


  showFailurePrompt(msg) {
    let prompt = this.alertCtrl.create({
      title: 'Error',
      message: msg ? msg : 'Error!',
      enableBackdropDismiss: true
    })

    prompt.present()
  }
}
