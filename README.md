# TT-datamining
Analysis of TT-produced log files
The software prompts the user to open a .csv (comma-separated values) file containing data logged as students work through the three-resistors activity. That data consists of a series of actions – some initiated by students, some automatic – each characterized by a certain number of fields describing the action. Each action is time-stamped and the files, which are produced by a CC-proprietary log manager, are usually sorted in order of increasing time.

The software makes two passes through the data. The first is performed after the data file is loaded. In this pass, the actions are parsed one-by-one and sorted into teams, levels (i.e., the level of difficulty of play in the game – a total of four levels in the present version), team members, and types of actions (e.g., messages, calculations, resistor changes, and so forth). This information is then used to create a table of checkboxes that the user can use to configure a query through the data. (The reason why these checkboxes cannot be instantiated until the first pass is complete is that until that happens we don't know the team names.)

The second pass through the data is initiated when the user clicks on a button labeled "Submit query" (which is created along with the checkboxes). This action results in the production and display of one or more reports, which are the intended final product of the analysis software. 

A guide to the architecture of this software can be found here: https://docs.google.com/document/d/1arRWFUTNOFHItcgtE8BIqBQSL0PvO0CjVsW6aBtvWfg/edit
