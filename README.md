<div align="center">
  <img align="center" width="300" src="https://github.com/Souyyy/Rave_project_react/blob/main/assets/icon.png" alt="Rave"/>
</div>

<h3 align="center">Rave Project</h3>
<p align="center">Ce projet permet d'enregistrer plusieurs pistes audio et d'avoir la possibilité de les transformer à partir du serveur <a align="center" href="https://github.com/gnvIRCAM/RAVE-ONNX-Server" target="_blank">RAVE</a>.</p>

## Installation depuis un code QR Expo
<p align="center">Voici le QR Code à scanner pour pouvoir acceder à l'application.</p>
<div align="center">
  <img align="center" width="200" src="https://github.com/Souyyy/Rave_project_react/blob/main/eas-update.svg" alt="Rave"/>
</div>

## Technologies
Ce projet utilise plusieurs technologies modernes pour créer une expérience interactive:

<table align="center"> <tbody> <tr> <td align="center"> <img width="75" src="https://reactnative.dev/img/header_logo.svg" alt="React Native" /> <p>React Native</p> </td> <td align="center"> <img width="75" src="https://redux.js.org/img/redux.svg" alt="Redux" /> <p>Redux Toolkit</p> </td> </tr> </tbody> </table>

## Installation sur machine

1. Veuillez installer le serveur et le lancer <a align="center" href="https://github.com/gnvIRCAM/RAVE-ONNX-Server" target="_blank">RAVE</a>

2. Cloner le projet
```git clone https://github.com/Souyyy/Rave_project_react/```.

3. Accéder au répertoire
```cd Rave_project_react```.

4. Installer les dépendances
```npm install```.

5. lancer le projet
```npm start```.

6. saisir l'adresse du serveur.

## Fonctionnalités réalisées

- **Écran d’accueil (`HomeScreen`) permettant :**

  - La saisie d’une adresse IP et d’un port.
  - Le test de la connexion avec un serveur distant.
  - La sauvegarde de la configuration dans Redux.
 
- **Écran `RecordScreen` :**

  - Enregistrement audio via le micro du téléphone.
  - Gestion des permissions micro (Android / iOS).
  - Sauvegarde locale et affichage des enregistrements sous forme de liste.
  - Possibilité d’écouter ou de supprimer les enregistrements.
  - Enregistrements gérés via Redux.
 
- **Écran `RaveScreen` :**

  - Sélection d’un modèle parmi plusieurs (Jazz, Parole, Chats, Chiens, Darbouka).
  - Sélection d’un clip audio précédemment enregistré.
  - Récupération du fichier transformé.
  - Lecture audio du fichier original et du fichier transformé.
