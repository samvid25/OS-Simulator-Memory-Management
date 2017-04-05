$(document).ready(function() {

  //variables required for the terminal-text-box
  var collection = ['Let\'s begin'];
  var write = 0;
  var flag2 = false;

  //all initial animations
  $("#input-q-box").animate({height: '75%'}, "ease");
  $("#block-0").animate({height: '90%'}, "ease");

  //all global variables
  var totalMemory = 1000;
  var num_of_processes = 0;
  var total_blocks = 1; //including deleted
  var total_blocks_queue = 1;
  var num_of_blocks = 1;
  var num_of_blocks_in_queue = 1;
  var processes_in_queue = [{
    size: 0,
    divID: 0
  }];
  //list of all blocks (/divs)
  var blocks = [{
    from: 0,
    to: 999,
    size: 1000,
    isAlloc: false,
    processID: 0,
    index: 0,
    divID: 0
  }];

  //debugging functions - to be removed later
  function debugprint()
  {
    var i;
    for(i = 0; i<num_of_blocks; i++)
      console.log("Div ID: " + blocks[i].divID + " Index: " + i + " Size: " + blocks[i].size + " From:" + blocks[i].from + " To:" + blocks[i].to + " Alloc: " + blocks[i].isAlloc);
  }

  //gets total memory from user and sets the memory block
  function getMemory() {
    $('#data-input-content-1').delay(1500).fadeIn('slow');
    $('#input-memory-submit').click(function(e) {
      totalMemory = parseInt($('memory').val());
      //sets the inital block (block 0)
      blocks[0].to = totalMemory-1;
      blocks[0].processID = NaN;
      blocks[0].from = 0;
      blocks[0].size = totalMemory;

      var confirm = window.confirm('Confirm details:\n Total Memory: ' + totalMemory);
      e.preventDefault();
      if(confirm){
        $('#data-input-content-1').fadeOut('fast');
      }
    })
  }


  var type = 0; //indicates type of fit

  //show fit buttons and disable once one of them is selected
  $('#worst-fit-select').removeAttr('disabled');
  $('#best-fit-select').removeAttr('disabled');
  $('#first-fit-select').removeAttr('disabled');

  $('#first-fit-select').click(function () {
      $('#best-fit-select').attr('disabled','');
      $('#worst-fit-select').attr('disabled','');
      type = 1;
  });

  $('#best-fit-select').click(function(){
      $('#first-fit-select').attr('disabled','');
      $('#worst-fit-select').attr('disabled','');
      type = 2;
  });

  $('#worst-fit-select').click(function () {
      $('#best-fit-select').attr('disabled','');
      $('#first-fit-select').attr('disabled','');
      type = 3;
  });

  $('#add-process-button').click(function(){
      var size = prompt('Enter Process Size: ');
      if(size != '')
       addNewProcess(parseInt(size));
      else
        alert('Enter a number greater than 1.');
  });


  //creates new process
  function addNewProcess(s){
    ++num_of_processes; //increment total number of processes
    var flag = 0; //to check if processes can be allocated or not

    for(var i = 1; i<=num_of_blocks; ++i){
      if(blocks[i-1].size >= s && blocks[i-1].isAlloc == false){
        console.log("Process " + num_of_processes + " can be allocated.");
        //put case for when block sizes are equal, no need to create new div
        collection.push("Process " + num_of_processes + " allocated to main memory.");
        switch (type) {
          case 1: firstFit(s);
                  break;
          case 2: bestFit(s);
                  break;
          case 3: worstFit(s);
                  break;
          default: break;
        }
        flag = 1;
        break;
      }
    }

    if (flag == 0){
      console.log("Process " + num_of_processes + "cannot be allocated to main memory.");
      collection.push("Process " + num_of_processes + " cannot be allocated to main memory. It is added to the input queue.");
      addToQueue(s);
      debugprint();
    }
  }

  //adds new div - takes new div id, and the id of the div to be added after
  function addNewDiv(divid, size, after)
  {
    if(after == -1)
    $('<div class="memory-block" id="block-'+ divid + '"></div>').insertAfter('#block--1');
    else if (after == 0)
      $('#block-0').append('<div class="memory-block" id="block-'+ divid + '"></div>');
    else
      $('<div class="memory-block" id="block-'+ divid + '"></div>').insertAfter('#block-' + after);
    //$('#block-' + divid).css('height', 100*(size/totalMemory) + "%");
    $('#block-' + divid).animate({height: 100*(size/totalMemory) + '%'}, "fast");
    $('#block-' + divid).css({"border-color": "#FFFFFF", "border-width":"2px", "border-style":"solid"});

    $('#block-' + divid).on('click', function() {
      removeProcess(divid);
    });
  }

  //resizes a block (div)
  function resizeDiv(divid, size)
  {
    if(divid == 0){
      $('#block-0').css('height', 90+"%");
      return;
    }
    var newHt = 100*(size/totalMemory);
    $('#block-' + divid).css('height', newHt + "%");
  }

  //deletes a block (div)
  function removeDiv(divid)
  {
    console.log("Removed div id: " + divid);
    $('#block-' + divid).remove();
  }

  //actually function will never be called because all adjusting is done earlier itself
  function compactSpaces()
  {
    var i;
    for(var i = 0; i<num_of_blocks-1; i++)
    {
      if(blocks[i].isAlloc == false && blocks[i+1].isAlloc == false)
      {
        console.log("Compacted adjacent free spaces");
        blocks[i+1].size += blocks[i].size;
        blocks[i+1].from = blocks[i].from;
        blocks[i+1].index = i;
        removeDiv(blocks[i].divID);
        resizeDiv(blocks[i+1].divID ,blocks[i+1].size);
        blocks.splice(i,1);
        num_of_blocks--;
      }
    }
  }

  //First fit algorithm. Takes size of process as parameter and creates process object
  function firstFit(s)
  {
    var newP = {
      from: 0,
      to: 0,
      size: 0,
      isAlloc: false,
      processID: 0,
      index: 0,
      divID: 0
    };
    for(var i = 1; i<=num_of_blocks; i++){
      console.log(blocks[i-1].size + "DIVID" + blocks[i-1].divID);
      if(blocks[i-1].size >= s && blocks[i-1].isAlloc == false)
      {
        //create new block
        newP.size = s;
        newP.isAlloc = true;
        newP.processID = total_blocks;
        newP.from = blocks[i-1].from;
        newP.to = newP.from + newP.size - 1;
        newP.divID = total_blocks;
        newP.index = i-1;

        //update values of the free block from where new block is added
        blocks[i-1].from = newP.to + 1;
        blocks[i-1].size -= newP.size;
        blocks[i-1].index = i;
        resizeDiv(blocks[i-1].divID, blocks[i-1].size);

        //add block to blocks list in correct position
        blocks.splice(i-1, 0, newP);

        //finally, since block is added, increment block counts
        ++num_of_blocks;
        ++total_blocks;

        //create a new div corresponding to block with new div id
        var afterWhere;
        if(i-1 == 0)
          //afterWhere = blocks[1].divID;
          afterWhere = -1;
        else
          afterWhere = blocks[i-2].divID;
        addNewDiv(newP.divID, newP.size, afterWhere);
        break;
      }
    }
  }

  //Worst fit algorithm. Takes size of process as parameter and creates process object
  function worstFit(s)
  {
    var max = blocks[0].size;
    var max_index = 0;
    var newP = {
      from: 0,
      to: 0,
      size: 0,
      isAlloc: false,
      processID: 0,
      index: 0,
      divID: 0
    };
    for(var i = 1; i<num_of_blocks; i++)
    {
      if(blocks[i].size > max && blocks[i].isAlloc == false)
      {
        max = blocks[i].size;
        max_index = i;
      }
    }

    //create new block
    newP.size = s;
    newP.isAlloc = true;
    newP.processID = total_blocks;
    newP.from = blocks[max_index].from;
    newP.to = newP.from + newP.size - 1;
    newP.divID = total_blocks;
    newP.index = max_index;

    //update values of the free block from where new block is added
    blocks[max_index].from = newP.to + 1;
    blocks[max_index].size -= newP.size;
    blocks[max_index].index = max_index+1;
    resizeDiv(blocks[max_index].divID, blocks[max_index].size);

    //add block to blocks list in correct position
    blocks.splice(max_index, 0, newP);

    //finally, since block is added, increment block counts
    ++num_of_blocks;
    ++total_blocks;

    //create a new div corresponding to block with new div id
    var afterWhere;
    if(max_index == 0)
      afterWhere = 0;
    else
      afterWhere = blocks[max_index-1].divID;
    addNewDiv(newP.divID, newP.size, afterWhere);

  }

  //Best fit algorithm. Takes size of process as parameter and creates process object
  function bestFit(s)
  {
    var fit = blocks[0].size;
    var fit_index = 0;

    //finding the first unallocated block
    for(var j = 0; j<num_of_blocks; j++)
      if(blocks[j].isAlloc == false)
      {
        fit = blocks[j].size;
        fit_index = j;
      }

    //create new process object
    var newP = {
      from: 0,
      to: 0,
      size: 0,
      isAlloc: false,
      processID: 0,
      index: 0,
      divID: 0
    };
    for(var i = 1; i<num_of_blocks; i++)
    {
      if(blocks[i].size < fit && blocks[i].isAlloc == false && blocks[i].size > s)
      {console.log("Entered");
        fit = blocks[i].size;
        fit_index = i;
      }
    }

    //create new block
    newP.size = s;
    newP.isAlloc = true;
    newP.processID = total_blocks;
    newP.from = blocks[fit_index].from;
    newP.to = newP.from + newP.size - 1;
    newP.divID = total_blocks;
    newP.index = fit_index;

    //update values of the free block from where new block is added
    blocks[fit_index].from = newP.to + 1;
    blocks[fit_index].size -= newP.size;
    blocks[fit_index].index = fit_index+1;
    resizeDiv(blocks[fit_index].divID, blocks[fit_index].size);

    //add block to blocks list in correct position
    blocks.splice(fit_index, 0, newP);

    //finally, since block is added, increment block counts
    ++num_of_blocks;
    ++total_blocks;

    //create a new div corresponding to block with new div id
    var afterWhere;
    if(fit_index == 0)
      afterWhere = 0;
    else
      afterWhere = blocks[fit_index-1].divID;
    addNewDiv(newP.divID, newP.size, afterWhere);
    debugprint();
  }

  //Removes a process from main memory. Takes the id of the div of the process to be removed as parameter.
  function removeProcess(id)
  {
    var i, j;
    for(i = 1; i<=num_of_blocks; i++)
    {
      if(blocks[i-1].divID == id && blocks[i-1].isAlloc){
        break;
      }
    }
    collection.push("Process " + blocks[i-1].processID + " is completed.");

    //variables to check if there are free spaces before and after the blocks assigned to the process
    var ptrBefore = 0;
    var ptrAfter = 0;
    var beforeFlag = 0;
    var afterFlag = 0;
    for(j = 1; j<=num_of_blocks; j++)
    {
      if((blocks[j-1].to == blocks[i-1].from - 1) && blocks[j-1].isAlloc == false)
      {
        ptrBefore = j-1;
        beforeFlag = 1;
      }
      if(blocks[j-1].from == blocks[i-1].to + 1 && blocks[j-1].isAlloc == false)
      {
        ptrAfter = j-1;
        afterFlag = 1;
      }
    }

    if(afterFlag == 0 && beforeFlag == 0)
    {
      console.log("no space before and after block");
      blocks[i-1].isAlloc = false;
      $('#block-' + blocks[i-1].divID).removeClass("memory-block");
    }
    else if(beforeFlag == 1 && afterFlag == 1)
    {
      console.log("free spaces before and after");
      blocks[ptrAfter].from = blocks[ptrBefore].from;
      blocks[ptrAfter].size = blocks[ptrAfter].size + blocks[ptrBefore].size + blocks[i-1].size;
      if(blocks[ptrAfter].size > totalMemory) blocks[ptrAfter].size = totalMemory;
      console.log(blocks[ptrAfter].size);
      removeDiv(blocks[ptrBefore].divID);
      removeDiv(blocks[i-1].divID);
      resizeDiv(blocks[ptrAfter].divID, blocks[ptrAfter].size);
      blocks.splice(i-1, 1);
      blocks.splice(ptrBefore, 1);
      num_of_blocks-=2;
    }
    else if (beforeFlag == 1)
    {
      console.log("Free space before block");
      blocks[ptrBefore].to = blocks[i-1].to;
      blocks[ptrBefore].size = blocks[ptrBefore].size + blocks[i-1].size;
      $('#block-' + blocks[i-1].divID).remove();

      var id2 = blocks[ptrBefore].divID;
      var height2 = 100*(blocks[ptrBefore].size/totalMemory);
      $('#block-' + id2).css('height', height2 + "%");
      blocks.splice(i-1, 1);
      num_of_blocks--;
    }
    else if(afterFlag == 1)
    {
      console.log("Free Space after block");
      blocks[ptrAfter].from = blocks[i-1].from;
      blocks[ptrAfter].size = blocks[ptrAfter].size + blocks[i-1].size;
      $('#block-' + blocks[i-1].divID).remove();

      var id2 = blocks[ptrAfter].divID;
      if(id2 == 0)
      {
        blocks.splice(i-1, 1);
        num_of_blocks--;
        debugprint();
        checkAndAddFromQueue();
        return;
      }
      var height2 = 100*(blocks[ptrAfter].size/totalMemory);
      $('#block-' + id2).css('height', height2 + "%");
      blocks.splice(i-1, 1);
      num_of_blocks--;
    }
    //compactSpaces(); //NO NEED
    //debugprint();
    checkAndAddFromQueue();
  }

  //Every time a process is deleted, this function is invoked, which checks if there are any processes in the input queue that can be allocated to the main memory.
  function checkAndAddFromQueue(){
    for(i = 1; i<=num_of_blocks_in_queue-1; i++){
      for(j = 1; j<=num_of_blocks; j++){
        if(processes_in_queue[i-1].size <= blocks[j-1].size && blocks[j-1].isAlloc == false)
        {
          console.log("Auto alloc to MM from queue");
          collection.push("Process " + num_of_processes + " added from input queue to main memory. ");
          num_of_blocks_in_queue--;
          switch (type) {
            case 1: $('#qblock-'+processes_in_queue[i-1].divID).remove();
                    firstFit(processes_in_queue[i-1].size);
                    processes_in_queue.splice(i-1, 1);
                    break;
            case 2: $('#qblock-'+processes_in_queue[i-1].divID).remove();
                    bestFit(processes_in_queue[i-1].size);
                    processes_in_queue.splice(i-1, 1);
                    break;
            case 3: $('#qblock-'+processes_in_queue[i-1].divID).remove();
                    worstFit(processes_in_queue[i-1].size);
                    processes_in_queue.splice(i-1, 1);
                    break;
          }
          i--;
          break;
        }
      }
    }
  }

  //If process cannot be fit in the main memory, it is added to the input queue
  function addToQueue(s){
    var newVar = {
      size: s,
      divID: total_blocks_queue
    };
    processes_in_queue.splice(0, 0, newVar);

    $('#input-q-box').append('<div class="memory-block" id="qblock-'+ total_blocks_queue + '"></div>');
    $('#qblock-' + total_blocks_queue).animate({height: 100*(s/600) + '%'}, "fast");
    $('#qblock-' + total_blocks_queue).css({"border-color": "#FFFFFF", "border-width":"2px", "border-style":"solid"});

    total_blocks_queue++;
    num_of_blocks_in_queue++;
  }


  //Functions to handle the terminal-text-box
  setInterval(callWriteTo,1000);

   function writeTo(){
       flag2 = true;
       if(write >= collection.length){
           flag2 = false;
           return;
       }

       $('#terminal-body').append('<div id="typed-'+ write +'"></div>');

       scrollTypedTextDown();

       if(write>0){
           $('#typed-'+(write-1)).find('.ti-cursor').addClass('is-hidden');
       }

       $('#typed-'+write).typeIt({
           strings: collection[write],
           autoStart: true,
           speed: 30,
           lifelife: false,

           callback: function () {
               write++;
               writeTo();
           }
       });
   }

   function check(){
       if( write < collection.length){
           return true;
       }else return false;
   }

   function callWriteTo(){
       if (check() && (flag2 == false)) {
           writeTo();
           return;
       }else return;
   }

   function scrollTypedTextDown(){
        var elem = document.getElementById('terminal-body');
        elem.scrollTop = elem.scrollHeight;
   }

   function scrollTableDown(){
        var elem = document.getElementById('top-box');
        elem.scrollTop = elem.scrollHeight;
}

})

//TO DO: ANIMATIONS
//HANDLE CASES WHEN PROCESS SIZE = BLOCK SIZE IF ANY ERRORS
//ADJUST TOTAL SIZE OF WAITING QUEUE
//REMOVE DEBUGGING FUNCTIONS AND CONSOLE LOGS
//TEST FOR CORNER CASES
//FINISH PAGE1
