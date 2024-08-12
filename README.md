# Google Sheets to Google Forms Generator

This project provides a streamlined way to generate Google Forms directly from a Google Sheet. By populating a Google Sheet with your quiz or survey questions, and using an Apps Script, you can automatically create a Google Form with all the necessary configurations.



## Features

- **Automatic Google Form Creation**: Define your questions, options, and settings in a Google Sheet, and generate a fully configured Google Form.
- **Support for Various Question Types**: Includes support for Multiple Choice, Checkbox, Short Answer, Paragraph, Dropdown, Scale, Grid, Date, and Time questions.
- **Optional Configurations**: Most fields are optional, with sensible defaults where applicable.



## How It Works

1. **Populate a Google Sheet**: Use the provided structure to enter your questions and configurations.
2. **Run the Apps Script**: The script will read your sheet and generate a Google Form with all your specified settings.



## API for Google Sheet Columns

Each column in the Google Sheet corresponds to a specific configuration for the questions in the Google Form.


| **Column Name**          | **Description**                                                                                   | **Type**                                                               | **Example Value**                                                   |
|--------------------------|---------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|---------------------------------------------------------------------|
| **Question**             | The text of the question.                                                                         | `string`                                                               | What is a pure function?                                            |
| **Type**                 | The type of question. Accepted values: `MCQ`, `Checkbox`, `Short Answer`, `Paragraph`, `Dropdown`, `Scale`, `Grid`, `Date`, `Time`. | `"MCQ" \| "Checkbox" \| "Short Answer" \| "Paragraph" \| "Dropdown" \| "Scale" \| "Grid" \| "Date" \| "Time"` | `MCQ`                                                               |
| **Options**              | The options for questions of type MCQ, Checkbox, Dropdown, or Grid, separated by commas.          | `string` (used for types: MCQ, Checkbox, Dropdown, Grid)                | `Option 1, Option 2, Option 3`                                       |
| **Réponse Correcte**      | The correct answer for the question.                                                             | `string` (or `string[]` for Checkbox with multiple answers)            | `Option 1`                                                          |
| **Obligatoire**          | Whether the question is mandatory. Accepted values: `Oui`, `Non`.                                | `"Oui" \| "Non"`                                                       | `Oui`                                                               |
| **Points** (Facultatif)  | The number of points awarded for a correct answer. If left empty, defaults to 0.                 | `number`                                                               | `10`                                                                |
| **Feedback Correct** (Facultatif) | Feedback provided if the correct answer is given.                                          | `string`                                                               | `Great job! This is the correct answer.`                             |
| **Feedback Incorrect** (Facultatif) | Feedback provided if the incorrect answer is given.                                      | `string`                                                               | `Sorry, the correct answer is Option 1.`                             |
| **Image URL** (Facultatif)  | URL of an image to display with the question.                                                 | `string` (URL)                                                         | `https://example.com/image.png`                                      |
| **Vidéo URL** (Facultatif)  | URL of a video to embed with the question.                                                    | `string` (URL YouTube)                                                 | `https://www.youtube.com/watch?v=example`                            |
| **Réponse Courte** (Facultatif)  | Expected answer for Short Answer questions.                                               | `string`                                                               | `A function without side effects.`                                   |
| **Case à Cocher Validation** (Facultatif) | Validation for Checkbox questions, such as the minimum number of correct answers expected. | `number`                                                               | `2`                                                                  |
| **Feedback Correct URL** (Facultatif)  | URL to provide additional information if the answer is correct.                     | `string` (URL)                                                         | `https://example.com/correct-answer-info`                            |
| **Feedback Incorrect URL** (Facultatif) | URL to provide additional information if the answer is incorrect.                   | `string` (URL)                                                         | `https://example.com/incorrect-answer-info`                          |














## Usage Instructions

1. **Setup the Google Sheet**: Create a new Google Sheet and use the column headers and structure described above : 

```txt
Question	Type	Options	Réponse Correcte	Obligatoire	Points	Feedback Correct (Facul.)	Feedback Incorrect (Facul.)	Section	Image URL (Facul.)	Vidéo URL	Réponse Courte (Facul.)	Case à Cocher Validation (Facul.)	Feedback Correct URL (Facul.)	Feedback Incorrect URL (Facul.)
```

2. **Run the Apps Script**: Copy the provided Apps Script into the Apps Script editor linked to your Google Sheet and run the script. It will give you the url of the form.

```javascript
function createGoogleFormFromSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Récupérer le titre du formulaire (vous pouvez définir un titre par défaut ici)
  var formTitle = "Quiz Généré Automatiquement";
  var form = FormApp.create(formTitle);
  
  // Activer les paramètres du Quiz
  form.setIsQuiz(true);

  // Boucler à partir de la 2ème ligne (index 1) pour ignorer les en-têtes
  for (var i = 1; i < data.length; i++) {
    var question = data[i][0];
    var type = data[i][1];
    var options = data[i][2] ? data[i][2].split(',') : [];
    var correctAnswer = data[i][3];
    var required = data[i][4].toLowerCase() === 'oui';
    var points = data[i][5] ? data[i][5] : 0;  // Points par défaut à 0 si non spécifié
    var feedbackCorrect = data[i][6];
    var feedbackIncorrect = data[i][7];
    var section = data[i][8];
    var imageUrl = data[i][9];
    var videoUrl = data[i][10];
    var shortAnswer = data[i][11];
    var checkboxValidation = data[i][12];
    var feedbackCorrectUrl = data[i][13];
    var feedbackIncorrectUrl = data[i][14];

    if (section) {
      form.addPageBreakItem().setTitle(section);
    }

    var item;
    switch (type.toLowerCase()) {
      case 'mcq':  // Multiple Choice Question
        item = form.addMultipleChoiceItem();
        item.setTitle(question)
            .setChoices(options.map(option => item.createChoice(option, option === correctAnswer)))
            .setPoints(points);
        break;
      case 'checkbox':
        item = form.addCheckboxItem();
        item.setTitle(question)
            .setChoices(options.map(option => item.createChoice(option)))
            .setPoints(points);
        if (checkboxValidation) {
          var validation = FormApp.createCheckboxValidation()
                                .requireSelectAtLeast(checkboxValidation)
                                .build();
          item.setValidation(validation);
        }
        break;
      case 'short answer':
        item = form.addTextItem();
        item.setTitle(question)
            .setPoints(points)
            .setHelpText('Réponse attendue: ' + shortAnswer);
        break;
      case 'paragraph':
        item = form.addParagraphTextItem();
        item.setTitle(question)
            .setPoints(points);
        break;
      case 'dropdown':
        item = form.addListItem();
        item.setTitle(question)
            .setChoices(options.map(option => item.createChoice(option, option === correctAnswer)))
            .setPoints(points);
        break;
      case 'scale':
        item = form.addScaleItem();
        item.setTitle(question)
            .setBounds(1, options.length)
            .setLabels(options[0], options[options.length - 1])
            .setPoints(points);
        break;
      case 'grid':
        item = form.addGridItem();
        item.setTitle(question)
            .setRows(options)
            .setColumns(['1', '2', '3', '4', '5']) // Ajoutez ou modifiez les colonnes selon vos besoins
            .setPoints(points);
        break;
      case 'date':
        item = form.addDateItem();
        item.setTitle(question)
            .setPoints(points);
        break;
      case 'time':
        item = form.addTimeItem();
        item.setTitle(question)
            .setPoints(points);
        break;
      default:
        Logger.log('Type de question non supporté : ' + type);
        continue;
    }

    if (required) {
      item.setRequired(true);
    }

    // Apply feedback only to compatible item types
    if (['mcq', 'checkbox', 'dropdown'].includes(type.toLowerCase())) {
      if (feedbackCorrect || feedbackCorrectUrl) {
        let feedback = FormApp.createFeedback().setText(feedbackCorrect);
        if (feedbackCorrectUrl) {
          feedback = feedback.addLink(feedbackCorrectUrl, "Plus d'informations");
        }
        item.setFeedbackForCorrect(feedback.build());
      }

      if (feedbackIncorrect || feedbackIncorrectUrl) {
        let feedback = FormApp.createFeedback().setText(feedbackIncorrect);
        if (feedbackIncorrectUrl) {
          feedback = feedback.addLink(feedbackIncorrectUrl, "Plus d'informations");
        }
        item.setFeedbackForIncorrect(feedback.build());
      }
    }

    // Ajouter une image si disponible
    if (imageUrl) {
      form.addImageItem().setImageUrl(imageUrl).setTitle(question);
    }

    // Ajouter une vidéo si disponible et valide
    if (videoUrl) {
      try {
        form.addVideoItem().setVideoUrl(videoUrl).setTitle(question);
      } catch (e) {
        Logger.log('Erreur lors de l\'ajout de la vidéo : ' + e.message);
      }
    }
  }

  Logger.log('Google Form créé : ' + form.getEditUrl());
}

