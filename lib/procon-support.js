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
      'procon-support:cerr': () => this.cerr()
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
        var vars = expr.substr(type.length + 1).split(/, */);
        // var_list += vars;
        Array.prototype.push.apply(var_list, vars);
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
    var editor = atom.workspace.getActiveTextEditor()
    editor.insertText('cout <<  << endl;\n');
    editor.moveUp();
    editor.moveRight(8);
  },
  cerr() {
    console.log('ProconSupport:cerr (only valid for debugging)!');
    var editor = atom.workspace.getActiveTextEditor()
    editor.insertText('fprintf(stderr, "\\n");\n');
    editor.moveToFirstCharacterOfLine();
    editor.insertText('#endif\n');
    editor.moveUp(2);
    editor.insertText('#ifdef DEBUG\n');
    editor.moveRight(21);
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
