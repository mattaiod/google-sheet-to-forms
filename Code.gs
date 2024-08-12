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
    Logger.log(data[i][4])
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
