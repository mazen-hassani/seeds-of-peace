//~ CopyLeft 2020 Michael Rouves

	//~ This file is part of Michael's Clicker.
	//~ Michael's Clicker is free software: you can redistribute it and/or modify
	//~ it under the terms of the GNU Affero General Public License as published by
	//~ the Free Software Foundation, either version 3 of the License, or
	//~ (at your option) any later version.

	//~ Michael's Clicker is distributed in the hope that it will be useful,
	//~ but WITHOUT ANY WARRANTY; without even the implied warranty of
	//~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	//~ GNU Affero General Public License for more details.

	//~ You should have received a copy of the GNU Affero General Public License
	//~ along with Michael's Clicker. If not, see <https://www.gnu.org/licenses/>.
//



//       									 ============= GLOBAL VARIABLES =============

var money = 0,//global player's money
        clickGain = 1,//money gain on clicker clicked =
        autoGain = 1,//auto money gain
        interval,//auto money interval
        peaceSeeds = 0;//counts planted seeds

//peace builder automation
var seedRate = 0;
var builders = {
  teacher:   {element: document.getElementById("teacher"),   cost: 100,  rate: 1,  count: 0, emoji: "📚👩‍🏫", label: "Teacher"},
  advocate:  {element: document.getElementById("advocate"),  cost: 500, rate: 5,  count: 0, emoji: "🗣️",    label: "Peace Advocate"},
  artist:    {element: document.getElementById("artist"),    cost: 1000, rate: 12, count: 0, emoji: "🎨",    label: "Artist"},
};

//background effect variables
var background = document.getElementById("background"),
        blurLevel = 5,
        grayLevel = 100;

// HTML MAIN ELEMENTS (except  shop buttons)
var element = {
        clicker   : document.getElementById("main-clicker"),//button
        money     : document.getElementById("money"),//txt
        seeds     : document.getElementById("seeds"),//peace seeds counter
}

//       									============= GLOBAL FUNCTIONS =============

function addMoney() { // onClicker pressed add ClickGain
  money = money + clickGain;
}
function updateMoney(check=true) {//update html money txt
  text = "$" + money;
  element.money.innerHTML = text;
  if(check){checkPrices();}
}
function updateSeeds(check=true){
  element.seeds.innerHTML = "Peace Seeds planted: " + peaceSeeds;
  if(check){checkBuilderPrices();}
}
function updateBackground(){
  blurLevel = Math.max(0, blurLevel - 0.1);
  grayLevel = Math.max(0, grayLevel - 2);
  background.style.filter = "grayscale("+grayLevel+"%) blur("+blurLevel+"px)";
}
function checkMilestones(){
  if([50,100,500].includes(peaceSeeds)){
    background.classList.add('flourish');
    setTimeout(function(){background.classList.remove('flourish');},2000);
  }
}
function autoMoney(amount) {//auto add money every interval
  clearInterval(interval);
  interval = setInterval(function(){ money = money + autoGain; updateMoney(); }, 200 / amount);
}

//called when a shop Element was bought
function checkPrices() {
        //Check price for each shop element
        //unlock purchase button if enough money
        for(let i=0;i<shop.length;i++){
                if(money >= shop[i].price){
                        shop[i].element.disabled = false;
                }
        }
}

function checkBuilderPrices(){
  for(const key in builders){
    const b = builders[key];
    if(peaceSeeds >= b.cost){
      b.element.disabled = false;
    }else{
      b.element.disabled = true;
    }
  }
}

function updateBuilderText(builder){
  builder.element.getElementsByTagName("b")[0].innerHTML =
    '<b>' + builder.cost + ' seeds: </b>' + builder.emoji + ' ' + builder.label +
    ' (' + builder.count + ')';
}

function purchaseBuilder(type){
  const b = builders[type];
  if(peaceSeeds < b.cost) return;
  peaceSeeds -= b.cost;
  b.count += 1;
  seedRate += b.rate;
  updateSeeds(false);
  updateBuilderText(b);
  checkBuilderPrices();
}
//called when a shop Element was bought
function onBuy(obj) {
	//update money
	money -= obj.price;
	updateMoney(check=false);
	//lock every purchase buttons in shop
	for(let i=0;i<shop.length;i++){
		shop[i].element.disabled = true;
	}
}

//       								 ============= SHOP BUTTON CLASS =============

class ShopElement{
	// Object for elements in the shop.
	// New Instance Token:
	//	 id -> html main element id (in Html)
	//   newprice_func -> the new price formula function
	//   onclick_func  -> the onClick function
	
	constructor (id,newprice_func,onclick_func) 
	{ //constructor: called on "new ShopElement()"
		this.id = id;
		this.element = document.getElementById(id);
		this.element.onclick = this.purchase.bind(this);
		this.text_element = this.element.getElementsByTagName("b")[0];
		
		this._updatePrice = newprice_func;
		this._onClick = onclick_func;
		
		this.price = 0;
		this.purchaseLvl = 1;
		this.updatePrice();
	}
	
	//Call default functions with this as argument
	onClick(){this._onClick(this);}
	updatePrice(){this._updatePrice(this);}
	
	//Update Button's txt price
	updateText(){
		this.text_element.innerHTML = "<b>" +'$'+this.price+': ' + "</b>";}
	
	// Update Every new purchase
	update(){
		this.updatePrice(); //calculate new price
		this.updateText();  //update displayed txt
	}
	// called on Element clicked
	purchase(){
		this.purchaseLvl += 1;
		this.onClick();
		onBuy(this);
		this.update()
		checkPrices();
	}
	
}

//       							 =============== SHOP BUTTONS & FUNCTIONS ===============

//alls buttons functions ( newPriceFormula , onClick )
function newPrice1(obj){obj.price = clickGain * 25 * obj.purchaseLvl;}
function newPrice2(obj){obj.price = 200 * obj.purchaseLvl;}
function newPrice3(obj){obj.price = autoGain * 30 * obj.purchaseLvl + 500;}
function onClick1(obj){clickGain*=2;}
function onClick2(obj){autoMoney(this.purchaseLvl);}
function onClick3(obj){autoGain*=2;}



//all shop's buttons
shop = [
	new ShopElement("b1",newPrice1,onClick1),
	new ShopElement("b2",newPrice2,onClick2),
	new ShopElement("b3",newPrice3,onClick3),
];

//       									 ================= START =================

// FIRST UPDATE (on page loaded)
updateMoney(); //money txt
updateSeeds(); //seed counter
for (let i=0;i<shop.length;i++){
        shop[i].update() //buttons txt & price
}

for(const key in builders){
  builders[key].element.onclick = purchaseBuilder.bind(null, key);
  updateBuilderText(builders[key]);
}
checkBuilderPrices();

setInterval(function(){
  if(seedRate>0){
    peaceSeeds += seedRate;
    updateSeeds(false);
    updateBackground();
    checkMilestones();
  }
},1000);

//set main clicker function onClick
element.clicker.onclick = function() {
        element.clicker.disabled = true;
        addMoney();
        updateMoney();
        peaceSeeds += 1;
        updateSeeds();
        updateBackground();
        checkMilestones();
        element.clicker.disabled = false;
};


