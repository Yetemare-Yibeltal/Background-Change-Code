
    const genHexaColor = ()=>{
      let str = '0123456789abcdef'
    hexa = '';
      for(let i = 0;i < 6; i++){
        let index = Math.floor
        (Math.random() * str.length)
      hexa = hexa + str
      [index]
      }
return '#' + hexa
    }
    
    const button =document.querySelector('button');
    document.body.style.background = genHexaColor();
    button.addEventListener('click',()=>{
      document.body.style.background = genHexaColor()
    })
    
  