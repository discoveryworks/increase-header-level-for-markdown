// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

function escapeRegex(string) {// Add an escape character before the regular retention character: // 在正则保留字符前面加上转义字符： \
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Functions that add strings before or after all strings that match regular expressions in the text to be matched // 给待匹配的文本中所有匹配正则表达式的字符串的前面或者后面加字符串的函数
// OurRegEx, nee re：正则表达式， 
// StringToBeAddedToTheFront, nee rp1 ：String to be added to the front // 要加在前面的字符串
// ToAddAStringAfter, nee rp2：To Add a String After // 要加在后面的字符串
// Text to be matched nee str // TextToBeMatched：待匹配的文本

function RegRemoveStr(OurRegEx, StringToBeAddedToTheFront, ToAddAStringAfter, TextToBeMatched) {
    var OurArrayOfTargetText = TextToBeMatched.match(OurRegEx);
    var ItemFromOurArrayOfTargetText = "";
    var ModifiedTextPayload = "";
    var OldTextPayload = null;

    if (!OurArrayOfTargetText) return TextToBeMatched;

    for (var i = 0; i < OurArrayOfTargetText.length; i++) {
		ItemFromOurArrayOfTargetText = escapeRegex(OurArrayOfTargetText[i]);//若ItemFromOurArrayOfTargetText中有保留的字符： ] [ ) ( } { . * + ? ^ $ \ |   则之后OldTextPayload会无法匹配ItemFromOurArrayOfTargetText
								//故使用自己定义的escapeRegex()在ItemFromOurArrayOfTargetText中可能出现的保留字符前面加上转义字符： \
		OldTextPayload = new RegExp(ItemFromOurArrayOfTargetText, "g");
		
		ModifiedTextPayload = StringToBeAddedToTheFront + OurArrayOfTargetText[i] + ToAddAStringAfter; // original version
		TextToBeMatched = TextToBeMatched.replace(OldTextPayload, ModifiedTextPayload);
    }

    return TextToBeMatched.slice(2);
}

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "helloworld" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.increase_header_level_for_markdown', function () {
		// The code you place here will be executed every time your command is executed

		let activeTextEditor = vscode.window.activeTextEditor;
		let activeDocument = activeTextEditor.document;

		// 1.  Get All Selected Line Information // 获取所有选中行信息
		let selection = vscode.window.activeTextEditor.selection;

		//  Start and end line number  // 起止行行号
		let startLine = selection.start.line;
		let endLine = selection.end.line;

		// 2. Gets text information for each line, which is a stored array of headers // 获取每行的文本信息，是标题的存入数组
		let titleArr = [];                                                           //  Select Line Information Cache Array // 选中行信息缓存数组
		var OurRegEx = new RegExp('^#+.*', "gm");
		// var OurRegEx = new RegExp('^[^\n\r]\s*#+.*', "gm");
		// var OurRegEx = new RegExp('(^\\s*\\#)\\s*((\\d+\\.)+)\\s+', "g");
		for(let i = startLine; i <= endLine; i++) {
			let curLineText = activeDocument.lineAt(i).text;                           //  Current Line Text Content  // 当前行文本内容
			let curLine_plus = RegRemoveStr(OurRegEx, "#", "", curLineText);               //  Rm `#` before the title

			titleArr.push({
				line: i,
				lineLength: curLineText.length,
				curLineText: curLineText,
				curLine_plus: curLine_plus
			});
		}
		
		
		// 3. Extract the new title w/ '#' // 把前面加了#的新标题提取出来
		let newText = titleArr.map(item => {
			return item.curLine_plus;
		});
		//vscode.Range4个参数的含义：startLine, startCharacter, endLine, endCharacter
		let replaceRange = new vscode.Range(startLine, 0, endLine, titleArr[titleArr.length - 1].lineLength);
		
		// 4. Call the edit interface to replace the original title with a new title with '#' // 调用编辑接口，用前面加了#的新标题，替换原来的标题
		activeTextEditor.edit((TextEditorEdit) => {
			TextEditorEdit.replace(replaceRange, newText.join('\n'));
		});

		// Display a message box to the user
		// vscode.window.showInformationMessage('success!');
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
