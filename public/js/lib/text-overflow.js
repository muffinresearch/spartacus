define([
  'jquery',
  'log'
], function($, log) {

  var $win = $(window);
  var w = $win.width();
  var timer;
  var checkOverflowClass = 'check-overflow';
  var monClassName = 'scroll-monitor';
  var resizeInited = false;
  var console = log('text-overflow');


  function checkTextOverflow() {
    var $elems = $('.' + checkOverflowClass);
    $elems.each(function(idx, elm) {
      var flow;
      var $elm = $(elm);
      var groupSelector = $elm.data('overflowGroupSelector');
      if (groupSelector) {
        // Find group elements;i
        var $elms = $elm.find(groupSelector);
        $elms.each(function(idx, elm){
          flow = checkElement($(elm));
          if (flow === 'over') {
            return false;
          }
        });
        fireOnFlowChange($elm, flow);
      } else {
        flow = checkElement($elm);
        fireOnFlowChange($elm, flow);
      }
    });
  }

  function fireOnFlowChange($elm, flow) {
    console.log($elm.prop('className'));
    console.log($elm.prop('nodeName'));
    var lastFlowEvent = $elm.data('lastFlowEvent');
    var lastFlowWinWidth = $elm.data('lastFlowWinWidth');
    console.log('lastFlowEvent: ' + flow);
    if (lastFlowEvent && lastFlowEvent === 'text' + flow + 'flow') {
      console.log('No change in flow state. noop.');
      return;
    } else if (flow === 'under' && $win.width() <= lastFlowWinWidth) {
      console.log('Window width is not bigger that last time overflow was detected. Noop');
      return;
    } else {
      console.log('Trigger event: text'+flow+'flow, on element: ' + JSON.stringify({
        nodeName: $elm.prop('nodeName'),
        className: $elm[0].className,
        id: $elm[0].id
      }));
      $elm.triggerHandler('text'+ flow +'flow');
      $elm.data('lastFlowEvent', 'text' + flow +'flow');
      if (flow === 'over') {
        $elm.data('lastFlowWinWidth', parseInt($win.width(), 10));
      }
    }
  }

  function checkElement($elm) {
    buildMonitor($elm);
    return getFlow($elm);
  }

  function buildMonitor($elm){
    if ($elm.find('.' + monClassName).length) {
      return;
    }

    console.log('Building text-overflow monitor');
    var oldPos = $elm.css('position');
    $elm.css({
      'position': oldPos === 'static' ? 'relative' : oldPos,
      'overflow': 'hidden'
    });

    var scrollMonitor = $('<div class="' + monClassName + '"></div>').css({
      'bottom': 0,
      'display': 'block',
      'font-family': $elm.css('font-family'),
      'font-size': $elm.css('font-size'),
      'left': 0,
      'overflow': 'scroll',
      'position': 'absolute',
      'right': 0,
      'text-overflow': 'none',
      'top': 0,
      'visibility': 'hidden',
    });

    var scrollMonitorInner = $('<span/>').css({
      'display': 'inline-block',
      'margin-left': $elm.css('margin-left'),
      'margin-right': $elm.css('margin-right'),
      'padding-left': $elm.css('padding-left'),
      'padding-right': $elm.css('padding-right'),
      'white-space': 'no-wrap',
    });

    scrollMonitorInner.text($elm.text());
    scrollMonitor.append(scrollMonitorInner);
    $elm.append(scrollMonitor);
  }

  function initOverflowResize(){
    if (resizeInited) {
      return;
    }
    console.log('initing resize');
    $win.on('resize.textoverflow', function(){
      window.clearTimeout(timer);
      timer = window.setTimeout(function() {
        console.log('resize');
        if (w !== $win.width()) {
          checkTextOverflow();
          w = $win.width();
        } else {
          console.log('width unchanged');
        }
      }, 250);
    });
    resizeInited = true;
  }

  function getFlow($elm){
    var $child = $elm.find('.' + monClassName);
    console.log('scrollWidth: ' + $child.prop('scrollWidth') +' clientWidth: ' +  $child.prop('clientWidth'));
    var flow = $child.prop('scrollWidth') > $child.prop('clientWidth') ? 'over' : 'under';
    return flow;
  }

  function init() {
    initOverflowResize();
    checkTextOverflow();
  }

  function destroy() {
    $win.unbind('resize.textoverflow');
    $('.' + monClassName).remove();
  }

  return {
    init: init,
    destroy: destroy,
  };

});

