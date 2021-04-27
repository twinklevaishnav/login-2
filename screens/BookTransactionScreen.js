import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView,ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config.js';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
    initiateBookIssue = () => { 
      //add a transaction
      db.collection("transactions")
      .add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Issue"
      });
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': false
      })
      //change number of books issued to the student
      db.collection("student").doc(this.state.scannedStudentId).update({
        'noOfBooksIssued': firebase.firestore.FieldValue.increment(1)})
        

        this.setState({ scannedStudentId: "", scannedBookId: ""});
      
    }
    initiateBookReturn = () => {

      //add a transaction
      db.collection("transactions")
      .add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Issue"
      });
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true
      })
      //change number of books issued to the student
      db.collection("student").doc(this.state.scannedStudentId).update({
        'noOfBooksIssued': firebase.firestore.FieldValue.increment(-1)})
        
        this.setState({ scannedStudentId: "", scannedBookId: ""});
    }


    checkStudenEligibilityForIssue = async () => {
      const studentRef = await db.collection("student")
      .where("studentId", "==", this.state.scannedStudentId)
      .get();

      var isStudentEligible = "";
      if(studentRef.docs.length == 0){
        
        isStudentEligible = false;
        alert("the student does not exsist in db")
      }
      else
      {
        studentRef.docs.map(doc => {
          var studentdata = doc.data();
          if (studentdata.numberOfBooksIssued < 2) {
            isStudentEligible = true;
          }
          else {
            isStudentEligible = false;
            alert("The student has already issued 2 books!");
            this.setState({
              scannedStudentId: "",
              scannedBookId: ""
            });
          }
        })
      }
      return   isStudentEligible  
    }


    checkStudentEligibilityForReturn = async () => {
      const transactionRef = await db
        .collection("transactions")
        .where("bookId", "==", this.state.scannedBookId)
        .limit(1)
        .get();
        
      var isStudentEligible = "";
      transactionRef.docs.map(doc => {

        var lastBookTransaction = doc.data();

        if (lastBookTransaction.studentId === this.state.scannedStudentId) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          alert("The book wasn't issued by the student!");
          this.setState({
            scannedStudentId: "",
            scannedBookId: ""
          });
        }
      });
      return isStudentEligible;
    };


    checkBookEligibility = async () => {
      const bookRef = await db.collection("books")
      .where("bookId", "==", this.state.scannedBookId)
      .get();

      var transactionType = "";
      if(bookRef.docs.length == 0){
        transactionType = false;
      }
      else {
        bookRef.docs.map( doc => {
          var bookdata = doc.data();

          if(bookdata.bookAvailability)
          { transactionType = "Issue"; }
          else
          { transactionType = "Return"; }
        });
      }
      return transactionType;
    }
    handleTransaction = async () => {
      var transactionType = await this.checkBookEligibility();

      if(!transactionType){
        alert("this book doesn't exist in the library");
        this.setState({scannedStudentId: "", scannedBookId: ""})
      }
      else if(transactionType === "Issue")
      {
        var isStudentEligible = await this.checkStudenEligibilityForIssue();
        if(isStudentEligible){
          this.initiateBookIssue();
          alert("book has been issued");
        }

        this.setState({ scannedStudentId: "", scannedBookId: ""});
      }
      else 
      {
        var isStudentEligible = await this.checkStudenEligibilityForReturn();
        if(isStudentEligible){
          this.initiateBookReturn();
          alert("book has been returned");
        }

        this.setState({ scannedStudentId: "", scannedBookId: ""});
      
         
      }
    }
    /*
    handleTransaction = async () => {
      var transactionMessage;

      db.collection("books")
      .doc(this.state.scannedBookId)
      .get()
      .then( () => {
        //console.log(doc.data());

        var book = doc.data();
        if(book.bookAvailability){
          this.initiateBookIssue();
          transactionMessage = "Book issued";
          ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
        } else
        {
          this.initiateBookReturn();
            transactionMessage = "Book Returned";
            ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
        }
      });

    }
    */
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView 
             style={styles.container} 
             behavior = "padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            
            <View style={styles.inputView}> 
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText = { (text) => {this.setState({scannedBookId: text}) } }
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText = { (text) => {this.setState({scannedStudentId: text}) } }
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            
            <TouchableOpacity style = {styles.submitButton}
                     onPress = { async () => {
                       this.handleTransaction; 
                       console.log("submitButton")}}>
              <Text>Submit</Text>
            </TouchableOpacity>
            
          </KeyboardAvoidingView>
        )
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    submitButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });