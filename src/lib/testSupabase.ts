import { supabase } from "./supabase"


async function test(){

const {data,error}=await supabase
.from("users")
.select("*")


console.log(data)
console.log(error)

}


test()