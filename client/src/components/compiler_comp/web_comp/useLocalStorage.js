import { useEffect,useState } from "react";
const prefix=  'web-code-';
export default function useLocalStorage(key,initialvalue){
const prefixedKey=prefix+key;
const [Value,setValue]=useState(()=>{
  const jsonValue=localStorage.getItem(prefixedKey)
  
  if(jsonValue!=null&&jsonValue!==undefined){
    try {
        return JSON.parse(jsonValue);
      } catch (error) {
        console.error("Error parsing JSON from localStorage", error);
        return initialvalue;
      }
  }  
  if(typeof initialvalue ==='function'){
    console.log(initialvalue())
    return initialvalue();
  }else{
    return initialvalue;
  }

})
useEffect(()=>{
 localStorage.setItem(prefixedKey,JSON.stringify(Value))
},[prefixedKey,Value])
 return [Value,setValue]
}