import React from 'react';
import {View,Text,StyleSheet,Image,TextInput,TouchableOpacity,Alert,KeyboardAvoidingView} from 'react-native';
import * as firebase from 'firebase';

export default class LoginScreen extends React.Component {

    constructor(){
        super();
        this.state={
          emailId : '',
          password: ''
        }
      }

      login = async(email,password) => {
        if (email && password){
            try{
              const response = await firebase.auth().signInWithEmailAndPassword(email,password)
              if(response){
                this.props.navigation.navigate('Transaction')
              }
            
            }
            catch(error){
                switch (error.code) {
                        case 'auth/user-not-found':
                        Alert.alert("user dosen't exists")
                        console.log("doesn't exist")
                    break
                        case 'auth/invalid-email':
                        Alert.alert('incorrect email or password')
                        console.log('invaild')
                    break
                }
            }
        }
        else{
          Alert.alert(' Please enter email and password');
        }
      }
      
      render(){
          return(
            <KeyboardAvoidingView style = {{alignItems:'center',marginTop:20}}>
            <View>
            <TextInput
              style={styles.loginBox}
              placeholder="email id here"
              keyboardType ='email-address'
              onChangeText={(text)=>{
                this.setState({
                  emailId: text
                })
              }}
            />
            <TextInput
              style={styles.loginBox}
              placeholder="Enter Password"
              secureTextEntry = {true}
              onChangeText={(text)=>{
                this.setState({
                   password: text
                })
              }}
            />
            </View>


            <View>
              <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7}}
                  onPress = { ()=>{
                      this.login(this.state.emailId,
                      this.state.password);
                      }}>
             <Text style={{textAlign:'center'}}>Login</Text>

            </TouchableOpacity>
            </View>
            
            </KeyboardAvoidingView>
          )
      }
    }
    const styles = StyleSheet.create({
        loginBox:
        {
          width: 300,
        height: 40,
        borderWidth: 1.5,
        fontSize: 20,
        margin:10,
        paddingLeft:10
        }
      })
      





















    