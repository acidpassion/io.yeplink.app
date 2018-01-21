export class Filter {
    constructor(
        public id:String,
        public description: String,
        public euroAsiaGuestTo:number,
        public euroAsiaGuestFrom:number,
        public euroAsiaHostTo:number,
        public euroAsiaHostFrom:number,
        public euroAsiaPanko:String,

        public startGuestTo:number,
        public startGuestFrom:number,
        public startHostTo:number,
        public startHostFrom:number,
        public startPanko:String,

        public nowGuestTo:number,
        public nowGuestFrom:number,
        public nowHostTo:number,
        public nowHostFrom:number,
        public nowPanko:String,

        public endGuestTo:number,
        public endGuestFrom:number,
        public endHostTo:number,
        public endHostFrom:number,
        public endPanko:String,
    ){}
  }
  