import React from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import db from '../config';


export default class Searchscreen extends React.Component {
constructor(){
  super();
  this.state = {
    allTransactions: [],
    lastVisibleTransaction: null,
    search:''
  }
}
fetchMoreTransactions = async ()=>{
  var text = this.state.search.toUpperCase()
  var enteredText = text.split("")

  
  if (enteredText[0].toUpperCase() ==='B'){
  const query = await db.collection("transactions").where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
  query.docs.map((doc)=>{
    this.setState({
      allTransactions: [...this.state.allTransactions, doc.data()],
      lastVisibleTransaction: doc
    })
  })
}
  else if(enteredText[0].toUpperCase() === 'S'){
    const query = await db.collection("transactions").where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    query.docs.map((doc)=>{
      this.setState({
        allTransactions: [...this.state.allTransactions, doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }
}
componentDidMount = async () => {
  const query = await db.collection("transactions").limit(10).get();
  //map will go over each element of the array one by one and do what is written inside map
  query.docs.map( (doc) => {
    this.setState ({
    //using spread operartor to append the new doc to allTransactions
    allTransactions: [...allTransactions, doc.data()]
    })
  })
}

    render() {
      return (
        /*
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          
          <ScrollView>
            {this.state.allTransactions.map((transaction, index) => {
              return(
              //every item in the list should have a unique key to identify the item
              //index is the index of the element in the array
              <View key = {index}>
                <Text>
                  {"Transaction Type: " + transaction.transactionType}
                </Text>
                <Text>
                  {"Book Id : " + transaction.bookId}
                </Text>
                <Text>
                  {"Student Id: " + transaction.studentId}
                </Text>
                <Text>
                  {"Date: " + transaction.date.toDate()}
                </Text>
                </View>
                )
              })
            }
          </ScrollView>
           
        
        </View>
        */

        <View style={styles.container}>
          {/*FlatList is a special component which does lazy loading 
          https://reactnative.dev/docs/flatlist#required-data */
          }
          <FlatList
          data={this.state.allTransactions}
          renderItem={({item})=>(
            <View style={{borderBottomWidth: 2}}>
              <Text>{"Book Id: " + item.bookId}</Text>
              <Text>{"Student id: " + item.studentId}</Text>
              <Text>{"Transaction Type: " + item.transactionType}</Text>
              <Text>{"Date: " + item.date.toDate()}</Text>
            </View>
          )}
          keyExtractor= {(item, index)=> index.toString()}
          onEndReached ={this.fetchMoreTransactions}
          onEndReachedThreshold={0.7}
        /> 
        </View>
      )
    
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20
  },
})