/*References: 
https://medium.com/@asimmittal/using-jquery-nodejs-to-scrape-the-web-9bb5d439413b
https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
https://www.w3schools.com/nodejs/nodejs_email.asp
https://stackoverflow.com/questions/26948516/nodemailer-invalid-login
https://www.geeksforgeeks.org/how-to-convert-a-currency-string-to-a-double-value-with-jquery-or-javascript/?ref=rp
*/
/*NOTE: It is NECESSARY to enable "Turn on Less Secure Apps" and "Display Unlock Captcha" for the Sender MailId. Failing to do so will result in a failure of the mailing system.
Turn on Less Secure Apps: https://myaccount.google.com/lesssecureapps
Display Unlock Captcha: https://accounts.google.com/DisplayUnlockCaptcha 
Visit these two links while logged in with your gmail account.
*/
const https = require('https');
const jsdom= require( "jsdom" );    //JsDOM turns raw html into a DOM Fragment. This is done because jQuery requires a window with a document, a Document Object Model(DOM) to work. 
const nodemailer = require('nodemailer');   //for mailing functionality.

var old_price=parseFloat(Number.MAX_VALUE);     //global old_price variable. updated whenever the new price is lesser than the old_price.
//EDIT THESE VALUES AND THE Product URL AS REQUIRED! Only Amazon URL's will work.
const sender_email="";
const sender_email_password="";
const recipient_email="";
const seconds=60;   //time interval between alerts in seconds.
const url="https://www.amazon.in/Logitech-G102-Customizable-Lighting-Programmable/dp/B08LT9BMPP/ref=sr_1_3_mod_primary_lightning_deal?dchild=1&keywords=logitech+g102+lightsync+gaming+mouse&qid=1613138146&sbo=Tc8eqSFhUl4VwMzbE4fw%2Fw%3D%3D&smid=A14CZOWI0VEHLG&sr=8-3";

function checker(){
    https.get(url, (resp) => {  //callback function with parameter resp
        let data = '';
      
        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          data += chunk;
        });
      
        // The whole response has been received. Do the required processing.
        resp.on('end', () => {
          var price=get_value(data);
          if(price<old_price)
          {
            sendMail(price,old_price);
            old_price=price;
          }
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
      
      function get_value(data){
          const {JSDOM} = jsdom;
          const dom = new JSDOM(data);
          const $ = (require("jquery"))(dom.window);
          var str=$("#priceblock_ourprice").text();     //the id of the element on the amazon page,that displays the price.
          str=str.substring(2).replace(/,/,'');     //to format the string(remove commas and the INR Symbol).
          var price=parseFloat(str);
          return price;
          //i am able to log the price,now to compare it with previous price and SEND MAIL if the price has reduced.
      }
      
      function sendMail(price,old_price){
          var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: sender_email,
                pass: sender_email_password
              }
            });
            
            var mailOptions = {
              from: sender_email,
              to: recipient_email,
              subject: 'Price Dropped',
              text: "The price has dropped to ₹"+price+"\nThe old price was ₹"+old_price
            };
            
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
      }
    
}
checker();      //run the checker on startup. Then,run it once every 12 hours.
setInterval(checker,seconds*1000);