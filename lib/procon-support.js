'use babel';

import ProconSupportView from './procon-support-view';
import { CompositeDisposable } from 'atom';

export default {

  proconSupportView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.proconSupportView = new ProconSupportView(state.proconSupportViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.proconSupportView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'procon-support:toggle': () => this.toggle(),
      'procon-support:cin': () => this.cin(),
      'procon-support:cout': () => this.cout(),
      'procon-support:cerr': () => this.cerr(),
      'procon-support:fprintf': () => this.fprintf()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.proconSupportView.destroy();
  },

  serialize() {
    return {
      proconSupportViewState: this.proconSupportView.serialize()
    };
  },


  cin() {
    console.log('ProconSupport:cin!');

    var ed = atom.workspace.getActiveTextEditor();
    var cursor = ed.getCursorBufferPosition();
    var line = ed.lineTextForBufferRow(cursor.row).trim();

    var var_list = [];
    var exprs = line.split(/; */);
    exprs.pop();
    for (var k in exprs) {
        var expr = exprs[k];
        var type = expr.split(' ', 1)[0];
        var vars_to_input = expr.substr(type.length + 1).split(/, */);
        Array.prototype.push.apply(var_list, vars_to_input);
    }
    // console.log(var_list);

    ed.insertText(' cin');
    for (var k in var_list) {
        ed.insertText(' >> ' + var_list[k]);
    }
    ed.insertText(';\n');
  },
  cout() {
    console.log('ProconSupport:cout!');
    var ed = atom.workspace.getActiveTextEditor()
    ed.insertText('cout <<  << endl;\n');
    ed.moveUp();
    ed.moveRight(8);
  },
  cerr() {
    console.log('ProconSupport:cerr (only valid for debugging)!');
    var ed = atom.workspace.getActiveTextEditor()
    var cursor = ed.getCursorBufferPosition();
    var line = ed.lineTextForBufferRow(cursor.row).trimRight();

    var matched = line.match(/^(\s*)(.*)/);
    var indent = matched[1], vars_to_print = matched[2].split(/, */);

    ed.selectLinesContainingCursors();
    ed.delete();

    ed.insertText('#ifdef DEBUG\n');
    for (var k in vars_to_print) {
        var v = vars_to_print[k];

        if (k == 0) {
            ed.insertText(indent + 'cerr');
        } else {
            ed.insertText(indent + '    ');
        }

        ed.insertText(' << "' + v + '=" << ' + v);

        if (k < vars_to_print.length-1) {
            ed.insertText(' << ", "\n');
        } else {
            ed.insertText(' << endl;\n');
        }
    }
    ed.insertText('#endif\n');
    ed.moveUp(2);
    ed.moveRight(21);
  },
  fprintf() {
    console.log('ProconSupport:fprintf (only valid for debugging)!');
    var ed = atom.workspace.getActiveTextEditor()
    ed.insertText('fprintf(stderr, "\\n");\n');
    ed.moveToFirstCharacterOfLine();
    ed.insertText('#endif\n');
    ed.moveUp(2);
    ed.insertText('#ifdef DEBUG\n');
    ed.moveRight(21);
  },

  toggle() {
    console.log('ProconSupport was toggled!');
    // return (
    //   this.modalPanel.isVisible() ?
    //   this.modalPanel.hide() :
    //   this.modalPanel.show()
    // );
  }

};
