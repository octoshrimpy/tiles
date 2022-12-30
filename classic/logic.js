
function ready(fn) {
  if (document.readyState != 'loading'){
    fn() //loading
  } else {
    document.addEventListener('DOMContentLoaded', fn) //ready
  }
}
ready(run)

//setting variables
let draggable = '.draggable';
let droppable = '.droppable';
let draggingSelector = '.dragme';
let revertDuration = 300; // unused
let highestTile = 0
let checkMovesTimeout

//jquery within this function
function run(){
   
  //add visiblity equivalent of hide()
  //visibility equivalent of hide()
  jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
  };

  jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
  };

  jQuery.fn.visibilityToggle = function() {
    return this.css('visibility', function(i, visibility) {
      return (visibility == 'visible') ? 'hidden' : 'visible';
    });
  };
  
  //actual logic
  createDraggable( draggingSelector, $(draggable) );
  createDroppable( $(droppable), droppable );
  
  addMore(3)
}


function createDroppable($droppableObj, acceptString, deactivateFunc = function(){}, dropInnerFunc = addToDroppable){
  $droppableObj.each(function(){
    
    $(this).droppable({
      accept: draggingSelector,
      activeClass: 'droppable-highlight',
      drop: function(event, ui){
        dropInnerFunc(event, ui);
        $droppableObj.each(function(){
          $(this).removeClass('droppable-highlight');
          $(this).removeClass('drag-within');
        });
      },
      over: function(event, ui){
        $(this).addClass('drag-within');
      },
      out: function(event,ui){
        $(this).removeClass('drag-within');
      },
      tolerance: 'pointer',
      deactivate: function(event, ui){
        deactivateFunc(event, ui)
      }
    });
  });
};

function addToDroppable(event, ui){
  $droppableContainer = event.target;
  $item = ui.draggable;
  $ghost = ui.helper;
  $parent = $item.parent();
  
  // parent is empty
  let parentisEmpty = $droppableContainer.querySelectorAll('.dragme:not(.revert-to-me):not(.ui-draggable-dragging)').length == 0 
  || $droppableContainer.childNodes.length == 0
  
  let wasOnBoard = $item[0].closest('.board')
  let dataVal = 0

  // dropping into empty slot
  if (parentisEmpty) {
    dataVal = Number($item[0].getAttribute('data-val'))
    $item.detach().appendTo($droppableContainer);  
  } else {
    // parent has child, increment stuff and remove ghosts
    let child = $droppableContainer.children[0]
    $item.animate({maxWidth: 'toggle'})
    // $ghost[0].style.display = 'none'
    $parent[0].removeChild($item[0])
    $parent[0].removeChild($ghost[0])
    dataVal = Number(child.getAttribute('data-val')) * 2
    child.setAttribute('data-val', dataVal)
    
    let tileContent
    if (dataVal > 9999) {
      tileContent = `${dataVal.toString().slice(0, -3)}k`
    } else {
      tileContent = dataVal
    }
    child.innerText = tileContent
  }
  
  // console.log($droppableContainer.children)
  runConfetti($droppableContainer, dataVal) 

  
  // add more tiles if pulled from source
  if($parent[0].classList.contains('source')) {
    addMore()  
    // @todo this needs to not be a timeout
    clearTimeout(checkMovesTimeout)
    checkMovesTimeout = setTimeout(checkMoves, 5000)
  }
  
  // if pulling from board and placing on board without merging
  if (parentisEmpty && wasOnBoard){
    return
  }
  // pulling from source straight into a merge, counts both as placement and merge
  if (!wasOnBoard && !parentisEmpty) {
    updateScoreWith(dataVal * 1.5)
    return
  }
  // default merge
  updateScoreWith(dataVal)
}

function updateScoreWith(val) {
  let scoreElm = document.querySelector('.score')
  let finalScoreElm = document.querySelector('.final_score .points')
  let oldScore = Number(scoreElm.innerText.replaceAll(',',''))
  let newScore = oldScore + val
  scoreElm.innerText = Number(newScore).toLocaleString()
  finalScoreElm.innerText = Number(newScore).toLocaleString()
}

function runConfetti($parent, val) {
    // check if highest tile so far
  if (val > highestTile) {
    highestTile = val
    console.log("highest so far! ", highestTile)
    
    // let fetiCountMod = val
    // for (let iter = 0; iter < 50; iter++) {
    //   let elm = document.createElement('i')
    //   elm.setAttribute(`fetti-${iter}`, true)
    //   $parent.append(elm)
    // }
    
    let count = Math.floor(val / 5000)
    for (let iter = 0; iter <= count; iter++){
      let elms = createFetti(iter)
      elms.forEach(elm => $parent.append(elm))
    }
    
    $parent.classList.add('confetti-drop')
  }

    //remove confetti after a second
  window.setTimeout(()=>{
    document.querySelectorAll('.confetti-drop').forEach(item => {
      item.querySelectorAll('i').forEach(i => item.removeChild(i))
      item.classList.remove('confetti-drop')
    })
  }, 800)
}

function createFetti(count){
  let elms = []
  for (let iter = 0; iter < 50; iter++) {
    let elm = document.createElement('i')
    elm.classList.add(`more-${count}`)
    elm.setAttribute(`fetti-${iter}`, true)
    elms.push(elm)
  }
  return elms
}

function checkDrops(dragElm){
  let val = dragElm.getAttribute('data-val') 
  let dropsAvailable = 0
  document.querySelectorAll(droppable).forEach((elm) => {
    let dropObjVal = elm.getAttribute('data-val')
    $(elm).droppable("disable")
    if(
      (elm.childNodes.length == 0 
      || !!elm.querySelector(`[data-val="${val}"]`))
      // && !elm.querySelector('.revert-to-me')
    ){
      $(elm).droppable("enable")
      dropsAvailable +=1
    }
  })

  
  return dropsAvailable
}

function createDraggable(selector, parentObj){
  $(selector, parentObj).draggable({
    helper: 'clone',
    start: function(event, ui){
      ui.helper.css({
        'height': $(this).outerHeight(),
        'width': $(this).outerWidth()
      });
      $(this)
        .invisible()
        .addClass('revert-to-me')
      $(this).parent().addClass('dragging-child')
        // .slideUp()
        // .animate({width: 'toggle', padding: 'toggle', margin: 'toggle'})
      checkDrops(this)
    },
    stop: function(event, ui){

      //recreate revert animation so it's in the right order
      $item = $('.revert-to-me');
      $ghost = ui.helper;

      // $item
      // .slideDown()
        // .animate({width: 'toggle', padding: 'toggle', margin: 'toggle'})

      $ghostClone = $ghost.clone();

      var moveClone = function(){
        var promise = $.Deferred();

        $ghostClone
          .css({
          'position': 'fixed'
        })
          .appendTo( $item.parent() )
          .animate({
          // top: $item.offset().top, // removes "go back to" animation
          // left: $item.offset().left
        })
          .queue(function(next){
          $(this).remove();
          promise.resolve();
          next();
        });
        return promise;
      }

      moveClone().done(function(){
        $item
          .visible()
          .removeClass('revert-to-me')
        $item.parent().removeClass('dragging-child')
      });
    }
  });
};


//// end jquery garbage

function addMore(count = 1){
  // add more tiles to source
  for(let iter = 0; iter < count; iter++) {
    let addTo = document.querySelector('.source')
    let value = ranPowOfTwo()

    let newElm = document.createElement('div')
    newElm.classList.add('dragme', 'is-silver', 'is-text-midnight')
    newElm.setAttribute('data-val', value)
    newElm.innerText = value

    addTo.append(newElm)
  }
  
  createDraggable( draggingSelector, $(draggable) )

}

function ranPowOfTwo(min=1, max=10) {
  return 2 ** Math.floor(Math.random()*(max - min + 1) + min);
}

function checkMoves(){
  console.log('checking moves')
  
  let workingMoves = 0
  let source = document.querySelector('.source')
  let board = document.querySelector('.board')
  
  if (source.children.length != 0) {

    // moves from source
    let sourceMoves = 0
    source.querySelectorAll('.dragme').forEach(elm => {
      let currentMoves = checkDrops(elm)
      // because you can always drop it back to where it was before
      if (currentMoves > 0) {currentMoves -= 1}
      sourceMoves += currentMoves
    })
    console.log('moves from source:', sourceMoves)

    // moves within the board
    let boardMoves = 0
    board.querySelectorAll('.droppable .dragme').forEach(elm => {
      let currentMoves = checkDrops(elm)
      // because you can always drop it back to where it was before
      if (currentMoves > 0) {currentMoves -= 1}
      boardMoves += currentMoves
    })
    console.log('moves from board:', boardMoves)
    
    
    workingMoves = boardMoves + sourceMoves
    // console.log('total moves:', workingMoves)

    if (workingMoves == 0){
    //@done redo end score alert
      // alert("game over!")
      gameEnded()
      return
    }
    
  }
}

function gameEnded(){
  // @done add proper animations here
  let restart = document.querySelector('.restart_wrap')
  restart.classList.add('show')
}


function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}