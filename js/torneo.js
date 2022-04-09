
var TEAM_NAME = 'Team Italia DOC';
var calcolaTeamsRun = false;
var calcolaClassificaRun = false;

var matchs = [];
var teams = [];


function elabora() {
    //Carico i dati di tutti i match
    for (var i in matchs) {
        sleep(50);

        if ( matchs[i].id != '' && matchs[i].id != '0')
            caricaMatch(i, 'https://api.chess.com/pub/match/' + matchs[i].id);
    };
}

function caricaMatch(index, url)
{

    console.log('caricaMatch ' + index + ' - ' + url);

    console.log(giocatori);
    //Leggo i dati 
    $.getJSON(url,function(data){

        console.log('caricaMatch. Dati di ' + this.url);

        //Dati Teams
        var dataTeams1;
        var dataTeams2;
        dataTeams1 = data.teams.team1;
        dataTeams2 = data.teams.team2;
        //Calcolo risultato
        if (data.status == 'registration') {
            matchs[index].risultato = 'In partenza';
            matchs[index].risultatoStyle = 'color:black;font-weight:bold';
        }

        //Salvo team per lettura avatar
//???????
        if (teams.indexOf(dataTeams1.name) == -1) {
            teams[dataTeams1.name] = {};
            var url;
            url = JSON.stringify(dataTeams1);
            url = url.substring(url.indexOf('@id":"')+6, url.length);
            url = url.substring(0, url.indexOf('"'));
            teams[dataTeams1.name].url = url;
            teams[dataTeams1.name].avatar = '';
        }
        if (teams.indexOf(dataTeams2.name) == -1) {
            teams[dataTeams2.name] = {};
            var url;
            url = JSON.stringify(dataTeams2);
            url = url.substring(url.indexOf('@id":"')+6, url.length);
            url = url.substring(0, url.indexOf('"'));
            teams[dataTeams2.name].url = url;
            teams[dataTeams2.name].avatar = '';
        }

        //controllo giocatori
        var username = '';
        for (var i in dataTeams1.players) {
            players = dataTeams1.players;
            username = players[i].username;

            //Se non esiste lo creo
            if (! giocatori[username]) {
               creaGiocatore(username, matchs[index].lega, dataTeams1.name);  
               if (dataTeams1.name == TEAM_NAME) {
                   giocatori[username].isDOC = true;
               } else {
                   giocatori[username].isDOC = false;
               }
            }
            giocatori[username].partite[matchs[index].lega+matchs[index].giornata] = {};
            giocatori[username].partite[matchs[index].lega+matchs[index].giornata].giornata = matchs[index].giornata;
            giocatori[username].partite[matchs[index].lega+matchs[index].giornata].lega = matchs[index].lega;
            if (matchs[index].lega != giocatori[username].lega) 
                giocatori[username].partite[matchs[index].lega+matchs[index].giornata].isMultiplyer = true;
            else
                giocatori[username].partite[matchs[index].lega+matchs[index].giornata].isMultiplyer = false;
            giocatori[username].partite[matchs[index].lega+matchs[index].giornata].url = 'https://www.chess.com/club/matches/' + matchs[index].id.toString();
        }
        username = '';
        for (var i in dataTeams2.players) {
            players = dataTeams2.players;
            username = players[i].username;

            //Se non esiste lo creo
            if (! giocatori[username]) {
               creaGiocatore(username, matchs[index].lega, dataTeams2.name);  
               if (dataTeams2.name == TEAM_NAME) {
                   giocatori[username].isDOC = true;
               } else {
                   giocatori[username].isDOC = false;
               }
            }
            giocatori[username].partite[matchs[index].lega+matchs[index].giornata] = {};
            giocatori[username].partite[matchs[index].lega+matchs[index].giornata].giornata = matchs[index].giornata;
            giocatori[username].partite[matchs[index].lega+matchs[index].giornata].lega = matchs[index].lega;
            if (matchs[index].lega != giocatori[username].lega) 
                giocatori[username].partite[matchs[index].lega+matchs[index].giornata].isMultiplyer = true;
            else
                giocatori[username].partite[matchs[index].lega+matchs[index].giornata].isMultiplyer = false;
            giocatori[username].partite[matchs[index].lega+matchs[index].giornata].url = 'https://www.chess.com/club/matches/' + matchs[index].id.toString();
        }

        //Se ho caricato tutti i dati calcolo la classifica
        matchs[index].daCaricare = false;
        for (var i in matchs) {
            if (matchs[i].daCaricare && matchs[i].id != '' && matchs[i].id != '0') {
                console.log('caricaMatch. Match da caricare: ' + i);
                return;
            }
        }
        
        //controllo di non aver già lanciato fase sucessiva
        if (calcolaTeamsRun)
            return;  
            calcolaTeamsRun = true;

        console.log('caricaMatch. Inizio getTeamAvatar');

        //Carico gli avatar degli teams
            //Cerco l'avatar per tutti i giocatori
        for (var name in teams) {
            sleep(5);
            //Cerco avatar
            if (! teams[name].avatar) 
                getTeamAvatar(teams[name].url);
        }    

    }).error(function(jqXhr, textStatus, error) {
        //è andato in errore ricarico i dati
        //Se responseJSON non è valorizzato solo se il record esiste    
        if (! jqXhr.responseJSON)
        {
            console.log('ERRORE ricarico dati: ' + this.url);
            var index = 0;
                for (var i in matchs) {
                    if (matchs[i].url = this.url)
                        index = i;
                };
                console.log('ERRORE ricarico dati: ricarico match ' + index);
                caricaMatch(index, this.url);    
            } else {
                console.log('ERRORE Match non valida. ' + this.url);
                console.log('ERRORE Match non valida. ' + this.url);
                console.log('ERRORE Match non valida. ' + this.url);
                console.log('ERRORE Match non valida. ' + this.url);
            }
              
        });
};

function getTeamAvatar(url)
{
    //Eseguo funzione per ricercare un avatar
    $.getJSON(url,function(data){
            teams[data.name].avatar = data.icon;    
            
        //Se non ho caricato tuti gli elo  esengo ancora la funzione
        for (var name in teams) {
            if (! teams[name].avatar) {
                return;
            }
        }

        if (calcolaClassificaRun)
            return;
            calcolaClassificaRun = true;

        //Stampo la tabelle dei teams
        getAvatar();

    }).error(function(jqXhr, textStatus, error) {
        //è andato in errore ricarico i dati
        getTeamAvatar(this.url);    
    });

}

function stampaTabelle() {
    for (var username in giocatori) {
        var stRiga = '<tr class="classifica-giocatori">' +

        '<td class="classifica-col2">' +
        '    <table><tr>' +
        '        <td>' +
        '        <img class="classifica-avatar" src="' + giocatori[username].avatar + '">' +
        '    </td>' +
        '    <td width=7px></td>' +
        '    <td><div>' +
        '            <a class="username" href="' + giocatori[username].url + '" target=”_blank”> ' + giocatori[username].displayName + '</a>' +
        '        </div> <div>  (' + giocatori[username].elo + ') </div>' +
        '        </td>' +    
        '    </tr></table>' +
        '</td>';

        var i = 1
        while (i < 9 ) {
            var myPartita = '';
            var isMultiplyer = false;

            //Cerco la partita
            for (var iPartita in giocatori[username].partite) {
                if (giocatori[username].partite[iPartita].giornata == i) {
                    if (myPartita == '')
                        //myPartita =  giocatori[username].partite[iPartita].lega;
                        myPartita = '<a href="' +  giocatori[username].partite[iPartita].url + '" target=”_blank”>' + giocatori[username].partite[iPartita].lega +' </a>';

                    else        
                        myPartita +=  ' - ' + '<a href="' +  giocatori[username].partite[iPartita].url + '" target=”_blank”>' + giocatori[username].partite[iPartita].lega +' </a>';
                }
                if(giocatori[username].partite[iPartita].isMultiplyer) isMultiplyer = true;
            }

            if (myPartita == '') {  
                //se Non ha giocato
                stRiga += '<td class="classifica-col3"></td>'
            } else {
               if (! isMultiplyer) {
                    // No multiplayer
                  stRiga += '<td class="classifica-col3">'
                  stRiga += myPartita;
                } else {
                    //Multiplayer
                    stRiga += '<td class="classifica-col3" style="color:red;font-weight:bold";>'
                    stRiga += myPartita.replace('<a', '<a style="color:red;font-weight:bold";');
                }
                stRiga += '</td>';
               }
            i++;
        }

        stRiga += '</tr>';

        //Se è doc scrivo sulle prime tabelle
        if (giocatori[username].isDOC ) {
            $('#'+giocatori[username].lega).append(stRiga);
        } else {
            //Stampo solo se multiplayer
            if ( isMultiplyer) {
                $('#MULTIPLAYER').append(stRiga);
            }
        }
    }    
}

function stampaTeams() {
        //Stampo la tabelle dei teams
        for (var index in matchs) {
           if ( matchs[index].id != '') { 
                var link = '';
                if  (matchs[index].id != '0') {
                   link = '<a href="' +  matchs[index].url + '" target=”_blank”> <img height="25" width="25" src="img/link.jpg"></a>';
                }
                var avatar = '';
                if (matchs[index].teamsoName != '') {
                    avatar = '<img class="classifica-avatar" src="' + teams[matchs[index].teamsoName].avatar + '"><a style="color:black;text-decoration: none;font-weight: normal;" href="' + 'teams[classificaTeams[i]].url' + '" target=”_blank”> ' + matchs[index].teamsoName + '</a>';
                }
                 var stRiga = '<tr class="classifica-giocatori">' +
                '<td class="classifica-col1">' + matchs[index].giornata + '</td>  ' +
                '<td class="giocatori-col1SEP">  </td>' +
                '<td class="classifica-lega-2">' + matchs[index].data + '</td> ' +
                '<td class="classifica-lega-3" style="border: 0px;"> ' + avatar + '</td>' +
                '<td class="classifica-lega-4">' + matchs[index].giocatori + '</td>' +
                '<td class="classifica-lega-4">' + matchs[index].score + '</td>' +
                '<td class="classifica-lega-4" style="' + matchs[index].risultatoStyle + '">' + matchs[index].risultato + '</td>' +
                '<td class="classifica-col1">' + link +'</td>' +
                '</tr>';

                $('#'+matchs[index].lega).append(stRiga);
                
           }
        }
        
        console.log('caricaMatch. Inizio getAvatar');

         //Ricerco elo e stampo classifica giocatori
        getAvatar();
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }     
