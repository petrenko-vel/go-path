// ===== КОНСПЕКТЫ этапов 0–2. Код проверен запуском на Go 1.24.7 =====
// блоки: ['p',html] ['h',text] ['ul',[html]] ['code',src] ['out',text] ['warn',html] ['tbl',[head],[rows]] ['mem',[head],[rows]]
const A=(u,t)=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`;
const TOPIC_DATA = {
"s0-0":{b:[
 ['p',`Любая программа на Go начинается с одного вопроса: <b>что должно получиться в итоге</b>. Просто увидеть результат на экране, получить готовый файл или установить инструмент, который можно вызывать из любой папки. На каждый из трёх случаев есть своя команда. Полный список команд лежит в ${A('https://pkg.go.dev/cmd/go','справочнике cmd/go')}, а здесь разберём три главные.`],
 ['h','1. Что делает каждая команда'],
 ['tbl',['Команда','Что делает','Что остаётся после'],[
  ['<code>go run main.go</code>','Собирает программу во временную папку, запускает и убирает за собой','Ничего. Исполняемого файла у тебя нет'],
  ['<code>go build</code>','Собирает программу и кладёт результат в текущую папку','Исполняемый файл рядом с кодом: <code>hello.exe</code> на Windows, <code>hello</code> на macOS и Linux'],
  ['<code>go install</code>','Собирает и копирует результат в общую папку установленных программ','Файл в <code>GOBIN</code> (по умолчанию <code>GOPATH/bin</code>): его можно вызывать откуда угодно']]],
 ['warn','Отправить программу человеку без Go: <code>go build</code> и передать получившийся файл. <code>go run</code> для этого не подходит, он ничего не оставляет.'],
 ['h','2. Попробуй руками'],
 ['p','Создай папку, а в ней файл <code>main.go</code>:'],
 ['code',`package main

import "fmt"

func main() {
	fmt.Println("привет")
}`],
 ['p','Затем три команды по очереди. После каждой смотри, что появилось в папке (<code>dir</code> в PowerShell, <code>ls</code> в bash):'],
 ['code',`go run main.go      # привет. Папка не изменилась
go build main.go    # появился main.exe (Windows) или main (macOS, Linux)
.\\main              # запуск файла в Windows; на macOS и Linux: ./main`],
 ['out','привет'],
 ['p','Для <code>go install</code> нужен модуль, то есть папка с файлом <code>go.mod</code> (подробно в следующей теме). Пока выполни три строки:'],
 ['code',`go mod init example.com/hello
go install
go env GOPATH`],
 ['p','Программа теперь лежит в папке <code>bin</code> внутри <code>GOPATH</code>. На Windows это обычно <code>C:\\Users\\&lt;имя&gt;\\go\\bin</code>.'],
 ['h','3. Куда попадает результат и при чём здесь PATH'],
 ['ul',[
  '<code>go build</code> кладёт файл туда, где ты стоишь, или туда, куда указал флаг <code>-o</code>: <code>go build -o app.exe</code>.',
  '<code>go install</code> кладёт файл в <code>GOBIN</code>. Если переменная не задана, берётся <code>GOPATH/bin</code>. Узнать пути: <code>go env GOBIN GOPATH</code>.',
  'Чтобы вызывать установленную программу по имени из любой папки, папка с ней должна быть в системной переменной <code>PATH</code>. Установщик Go добавляет в <code>PATH</code> саму команду <code>go</code>, а вот <code>GOPATH/bin</code> иногда приходится добавить вручную.',
  `Подробнее про установку и переменные: ${A('https://go.dev/doc/install','Download and install')}.`]],
 ['h','4. Что ещё стоит знать про сборку'],
 ['tbl',['Что нужно','Как'],[
  ['Собрать пакет из текущей папки','<code>go build .</code> или просто <code>go build</code> (нужен <code>go.mod</code>)'],
  ['Собрать всё в проекте','<code>go build ./...</code>'],
  ['Запустить пакет, а не один файл','<code>go run .</code>'],
  ['Назвать результат по-своему','<code>go build -o myapp.exe .</code>'],
  ['Показать, какие пакеты собираются','<code>go build -v</code>'],
  ['Собрать для другой системы','Bash: <code>GOOS=linux GOARCH=amd64 go build -o hello-linux .</code><br>PowerShell: <code>$env:GOOS="linux"; $env:GOARCH="amd64"; go build -o hello-linux .</code> (потом <code>Remove-Item Env:GOOS,Env:GOARCH</code>)']]],
 ['p','Кросс-компиляция: Go собирает программы под другую ОС и процессор одной командой, без дополнительных инструментов. Это одна из причин, почему на нём любят писать утилиты и сервисы. Список допустимых значений <code>GOOS</code> и <code>GOARCH</code> выводит <code>go tool dist list</code>.'],
 ['h','5. Частые ошибки'],
 ['tbl',['Сообщение','Что значит и что делать'],[
  ['<code>go: go.mod file not found in current directory or any parent directory</code>','Ты не в папке модуля. Перейди в корень проекта или выполни <code>go mod init имя</code>. С <code>go run main.go</code> такой ошибки нет: там указан конкретный файл'],
  ['<code>"go" не является внутренней или внешней командой</code>','Go не найден в <code>PATH</code>. Закрой и открой терминал, а если не помогло, переустанови Go или добавь папку <code>bin</code> установки в <code>PATH</code>'],
  ['После <code>go install</code> программа не запускается по имени','<code>GOPATH/bin</code> не в <code>PATH</code>. Добавь её или запускай по полному пути'],
  ['<code>package command-line-arguments is not a main package</code>','В файле нет <code>package main</code> или функции <code>main</code>. Это библиотека, запустить её нельзя']]],
 ['h','6. Практика и чек-лист'],
 ['ol',[
  'Напиши три маленькие программы: вывод строки, сумма двух чисел, вывод текущего года (<code>time.Now().Year()</code>).',
  'Каждую запусти тремя способами: <code>go run</code>, <code>go build</code>, <code>go install</code>.',
  'После каждой команды посмотри содержимое папки и папки <code>GOPATH/bin</code>, запиши результат в таблицу из трёх столбцов: команда, что появилось, где.',
  'Собери одну из программ под Linux флагами <code>GOOS</code> и <code>GOARCH</code> и убедись, что на Windows она не запускается.',
  'Создай репозиторий <code>go-learning</code> и положи туда эти программы.']],
 ['src',[
  ['Tutorial: Get started with Go','https://go.dev/doc/tutorial/getting-started','Официальный первый урок: Hello World, пакеты, go run','en'],
  ['Справочник команд go (cmd/go)','https://pkg.go.dev/cmd/go','Все команды и флаги в одном месте: build, run, install и остальные','en'],
  ['Download and install','https://go.dev/doc/install','Установка Go и проверка командой go version','en'],
  ['How to Write Go Code','https://go.dev/doc/code','Как устроены пакеты и модули, что делает go install','en'],
  ['Go by Example: Hello World','https://gobyexample.com/hello-world','Короткий рабочий пример, можно сразу запустить','en'],
  ['A Tour of Go','https://go.dev/tour/welcome/1','Интерактивная прогулка по языку прямо в браузере','en']]]],
 q:[["Чем отличается go build от go run?","build оставляет исполняемый файл, run собирает во временную папку, запускает и ничего не сохраняет."],["Какой командой подготовить файл для друга без Go?","go build, затем отправить получившийся файл."],["Куда попадает результат go install?","В папку GOBIN, а если она не задана, в GOPATH/bin."],["Почему установленная программа не запускается по имени?","Папка GOPATH/bin не добавлена в PATH."],["Как собрать программу под Linux, сидя на Windows?","Задать переменные GOOS=linux и GOARCH=amd64 и выполнить go build."]],
 l:[["doc","Tutorial: Get started with Go","https://go.dev/doc/tutorial/getting-started","en"],["doc","Справочник команд go (cmd/go)","https://pkg.go.dev/cmd/go","en"],["doc","Download and install","https://go.dev/doc/install","en"],["doc","How to Write Go Code","https://go.dev/doc/code","en"],["trainer","A Tour of Go","https://go.dev/tour/welcome/1","en"],["trainer","Go by Example: Hello World","https://gobyexample.com/hello-world","en"]]},
"s0-1":{b:[
 ['p',`Модули нужны, чтобы Go знал, <b>из чего состоит твой проект</b> и от каких чужих пакетов он зависит. Без модуля нельзя ни подключить библиотеку, ни разложить код по папкам. Ниже вся тема на одном рабочем примере; официальный разбор лежит в ${A('https://go.dev/doc/tutorial/create-module','туториале по созданию модуля')} и ${A('https://go.dev/ref/mod','справочнике по модулям')}.`],
 ['h','1. Словарь темы'],
 ['tbl',['Термин','Что это'],[
  ['<b>Пакет</b>','Папка с <code>.go</code>-файлами, у которых одинаковая первая строка <code>package имя</code>. Минимальная единица, которую можно импортировать'],
  ['<b>Модуль</b>','Проект целиком: набор пакетов под одним корнем. Корень отмечает файл <code>go.mod</code>'],
  ['<b>Путь импорта</b>','Адрес пакета в <code>import</code>: имя модуля + путь к папке, например <code>example.com/proj/greet</code>'],
  ['<code>go.mod</code>','Имя модуля, версия Go и список зависимостей. Правится командами, руками почти не нужно'],
  ['<code>go.sum</code>','Контрольные суммы зависимостей. Защищает от подмены: Go проверяет, что скачал именно то, что нужно']]],
 ['h','2. Создаём модуль'],
 ['code',`mkdir proj && cd proj
go mod init example.com/proj   # создаёт go.mod`],
 ['p','После команды в папке появится файл <code>go.mod</code>:'],
 ['code',`module example.com/proj

go 1.24`],
 ['ul',[
  'Имя модуля: если проект будет лежать на GitHub, используй <code>github.com/логин/репозиторий</code>. Для учебных проектов подойдёт и <code>example.com/proj</code>.',
  'Строка <code>go</code> задаёт минимальную версию языка. У тебя в файле будет версия твоей установки.',
  'Файл <code>go.mod</code> коммитят в git вместе с кодом.']],
 ['h','3. Два пакета в одном модуле'],
 ['p','Разложим код по папкам. Структура:'],
 ['code',`proj/
├── go.mod
├── main.go          // package main: точка входа
└── greet/
    └── greet.go     // package greet: наш собственный пакет`],
 ['p','Файл <code>greet/greet.go</code>:'],
 ['code',`package greet

import "fmt"

// Hello возвращает приветствие.
// Имя с заглавной буквы: функцию видно из других пакетов.
func Hello(name string) string {
	return fmt.Sprintf("Привет, %s!", name)
}`],
 ['p','Файл <code>main.go</code> подключает его по пути импорта: имя модуля плюс папка.'],
 ['code',`package main

import (
	"fmt"

	"example.com/proj/greet"
)

func main() {
	fmt.Println(greet.Hello("Валерия"))
}`],
 ['code','go run .'],
 ['out','Привет, Валерия!'],
 ['ul',[
  '<b>Видимость задаётся регистром первой буквы.</b> <code>Hello</code> видно из других пакетов, <code>hello</code> только внутри <code>greet</code>. Ключевых слов <code>public</code> и <code>private</code> в Go нет.',
  'Имя пакета по традиции совпадает с именем папки. Исключение одно: точка входа всегда <code>package main</code>.',
  `Рекомендуемую раскладку больших проектов смотри в ${A('https://go.dev/doc/modules/layout','Organizing a Go module')}.`]],
 ['h','4. Подключаем чужую библиотеку'],
 ['p','Допишем в <code>main.go</code> импорт внешнего пакета <code>rsc.io/quote</code> (его использует официальный туториал) и вызов <code>quote.Go()</code>. Go ещё не знает про эту зависимость и скажет:'],
 ['out',`main.go:7:2: no required module provides package rsc.io/quote; to add it:
	go get rsc.io/quote`],
 ['p','Скачать и записать зависимость можно двумя способами: <code>go get rsc.io/quote</code> или <code>go mod tidy</code>. Второй подтянет всё, что нужно коду, и уберёт лишнее. После него:'],
 ['code',`module example.com/proj

go 1.24

require rsc.io/quote v1.5.2

require (
	golang.org/x/text v0.0.0-20170915032832-14c0d48ead0c // indirect
	rsc.io/sampler v1.3.0 // indirect
)`],
 ['ul',[
  '<code>require</code> перечисляет зависимости с версиями.',
  'Пометка <code>// indirect</code> значит: этот пакет нужен не тебе, а твоей зависимости.',
  'Рядом появился <code>go.sum</code> с контрольными суммами. Его тоже коммитят и руками не правят.']],
 ['h','5. Команды для работы с модулем'],
 ['tbl',['Команда','Зачем'],[
  ['<code>go mod init имя</code>','Создать <code>go.mod</code> в текущей папке'],
  ['<code>go mod tidy</code>','Привести зависимости в порядок: добавить недостающие, убрать лишние. Запускай после правок импортов'],
  ['<code>go get пакет</code>','Добавить зависимость; <code>go get пакет@v1.2.3</code> берёт конкретную версию'],
  ['<code>go list -m all</code>','Показать все зависимости, включая косвенные'],
  ['<code>go mod why пакет</code>','Объяснить, почему пакет оказался в проекте'],
  ['<code>go mod download</code>','Скачать зависимости заранее, без сборки']]],
 ['p',`Разбор того же в официальной документации: ${A('https://go.dev/doc/modules/managing-dependencies','Managing dependencies')} и ${A('https://go.dev/doc/modules/gomod-ref','go.mod file reference')}. Историю вопроса, зачем модули заменили старый <code>GOPATH</code>, рассказывает ${A('https://go.dev/blog/using-go-modules','Using Go Modules')} в блоге Go.`],
 ['h','6. Частые ошибки'],
 ['tbl',['Сообщение','Что делать'],[
  ['<code>go: go.mod file not found in current directory or any parent directory</code>','Перейти в папку модуля или выполнить <code>go mod init</code>'],
  ['<code>no required module provides package ...</code>','Зависимость не записана: <code>go mod tidy</code> или <code>go get пакет</code>'],
  ['<code>package example.com/proj/greet is not in std</code>','Имя в <code>import</code> не совпадает с именем модуля плюс папкой. Сверь с первой строкой <code>go.mod</code>'],
  ['<code>found packages main and greet in ...</code>','В одной папке лежат файлы с разными именами пакетов. Один пакет на папку'],
  ['<code>import cycle not allowed</code>','Пакеты импортируют друг друга по кругу. Вынеси общее в третий пакет']]],
 ['warn','Типичная ловушка: пакет <code>main</code> нельзя импортировать. Код, который хочешь переиспользовать, выноси в отдельный пакет, как <code>greet</code> выше.'],
 ['h','7. Практика'],
 ['ol',[
  'Создай модуль с двумя пакетами и одной внешней зависимостью по образцу выше, назови его <code>github.com/твой-логин/go-learning</code>.',
  'Добавь в пакет <code>greet</code> функцию с маленькой буквы и убедись, что из <code>main</code> её вызвать нельзя (прочитай текст ошибки).',
  'Выполни <code>go mod tidy</code>, посмотри <code>go.mod</code> и <code>go.sum</code> до и после.',
  'Командой <code>go mod why rsc.io/sampler</code> узнай, зачем нужна косвенная зависимость.',
  'Закоммить <code>go.mod</code> и <code>go.sum</code> в репозиторий.']],
 ['src',[
  ['Tutorial: Create a Go module','https://go.dev/doc/tutorial/create-module','Официальный туториал: свой модуль, функция, вызов из другого модуля','en'],
  ['Go Modules Reference','https://go.dev/ref/mod','Полное справочное описание модулей, версий и go.sum','en'],
  ['go.mod file reference','https://go.dev/doc/modules/gomod-ref','Все директивы go.mod: module, go, require, replace и другие','en'],
  ['Managing dependencies','https://go.dev/doc/modules/managing-dependencies','Как добавлять, обновлять и удалять зависимости','en'],
  ['Organizing a Go module','https://go.dev/doc/modules/layout','Как раскладывать пакеты и папки в проекте','en'],
  ['Using Go Modules (блог Go)','https://go.dev/blog/using-go-modules','Пошаговый рассказ с примерами: от init до обновления версий','en'],
  ['How to Write Go Code','https://go.dev/doc/code','Пакеты, импорты и установка в одном материале','en']]]],
 q:[["Что такое go.mod?","Файл в корне проекта: имя модуля, версия Go, зависимости."],["Откуда стартует программа?","С функции main в пакете main."],["Чем пакет отличается от модуля?","Пакет это папка с .go-файлами одного package, модуль это проект целиком с файлом go.mod."],["Как сделать функцию видимой из другого пакета?","Назвать её с заглавной буквы."],["Зачем нужен go.sum и надо ли его коммитить?","Он хранит контрольные суммы зависимостей и защищает от подмены; коммитить надо."],["Что делает go mod tidy?","Добавляет недостающие зависимости и убирает лишние."]],
 l:[["doc","Tutorial: Create a Go module","https://go.dev/doc/tutorial/create-module","en"],["doc","Go Modules Reference","https://go.dev/ref/mod","en"],["doc","go.mod file reference","https://go.dev/doc/modules/gomod-ref","en"],["doc","Managing dependencies","https://go.dev/doc/modules/managing-dependencies","en"],["doc","Organizing a Go module","https://go.dev/doc/modules/layout","en"],["art","Using Go Modules (блог Go)","https://go.dev/blog/using-go-modules","en"],["doc","How to Write Go Code","https://go.dev/doc/code","en"]]},
"s0-2":{b:[
 ['p',`Эти два инструмента проверяют код, не запуская его. <code>go fmt</code> отвечает за <b>оформление</b>, <code>go vet</code> за <b>подозрительные места</b>, которые компилятор пропускает. Оба входят в установку Go. Для настройки редактора, чтобы они работали сами, смотри последний раздел.`],
 ['h','1. go fmt: единый стиль без споров'],
 ['p','В Go нет споров про табы и пробелы: стиль задаёт <code>gofmt</code>, и весь мир пишет одинаково. Сравни:'],
 ['code',`func main() {
        score := 99.5
    fmt.Printf("%s\\n", score)
}`],
 ['p','Отступы разные: где-то пробелы, где-то табы. Прогоним через форматтер:'],
 ['code',`gofmt -l .     # показать файлы, которые нужно отформатировать
gofmt -d .     # показать, что именно изменится
go fmt ./...   # отформатировать всё в проекте (внутри вызывает gofmt -l -w)`],
 ['out',`-        score := 99.5
-    fmt.Printf("%s\\n", score)
+\tscore := 99.5
+\tfmt.Printf("%s\\n", score)`],
 ['tbl',['Команда','Что делает'],[
  ['<code>gofmt -l .</code>','Только перечисляет файлы, ничего не меняет'],
  ['<code>gofmt -d .</code>','Печатает разницу (diff), файлы не трогает'],
  ['<code>gofmt -w файл.go</code>','Перезаписывает файл'],
  ['<code>go fmt ./...</code>','То же самое для всех пакетов проекта, выводит имена изменённых файлов']]],
 ['ul',[
  'Форматтер <b>не меняет смысл</b> программы, только пробелы, отступы и порядок выравнивания.',
  `Правила стиля описаны в ${A('https://go.dev/doc/effective_go#formatting','Effective Go: Formatting')}, а зачем так сделано, объясняет ${A('https://go.dev/blog/gofmt','пост в блоге Go')}.`,
  'Команда <code>gofmt</code> лежит в <code>cmd/gofmt</code>; все флаги в ' + A('https://pkg.go.dev/cmd/gofmt','документации')+'.']],
 ['h','2. go vet: ищет баги, которые компилятор пропускает'],
 ['code',`package main

import "fmt"

func main() {
	score := 99.5
	fmt.Printf("%s\\n", score)
}`],
 ['p','Программа компилируется и запускается, но выводит странное:'],
 ['out','%!s(float64=99.5)'],
 ['p','А вот что скажет <code>go vet ./...</code>:'],
 ['out','main.go:7:17: fmt.Printf format %s has arg score of wrong type float64'],
 ['p','Читать сообщение надо слева направо: <b>файл</b>, <b>строка</b>, <b>колонка</b>, <b>что не так</b>. Здесь: формат <code>%s</code> ждёт строку, а передано число. Правильно <code>%v</code> или <code>%.1f</code>.'],
 ['tbl',['Инструмент','Что ловит'],[
  ['<code>go build</code> / <code>go run</code>','Ошибки, из-за которых программа не соберётся'],
  ['<code>go vet</code>','Вероятные баги в собранном коде: неверные форматы в <code>Printf</code>, недостижимый код, копирование блокировок, неверные теги структур, потерянный <code>cancel</code> у контекста'],
  ['<code>go fmt</code>','Оформление: отступы, пробелы, выравнивание']]],
 ['warn','Прочитай сообщение vet сама: файл, строка, колонка, что не так. Сначала сформулируй своими словами, что оно значит, и только потом чини. Список всех проверок: ' + A('https://pkg.go.dev/cmd/vet','документация vet')+'.'],
 ['h','3. Редактор: пусть всё делается само'],
 ['p',`Самый простой путь: Visual Studio Code с расширением Go (${A('https://code.visualstudio.com/docs/languages/go','официальная инструкция VS Code')}). Расширение подключает языковой сервер ${A('https://go.dev/gopls/','gopls')}: подсказки, переход к определению, переименование, а ещё он умеет форматировать код и расставлять импорты.`],
 ['ol',[
  'Установи VS Code и расширение <b>Go</b> (издатель Go Team at Google, идентификатор <code>golang.go</code>).',
  'Нажми <code>Ctrl+Shift+P</code>, выбери <b>Go: Install/Update Tools</b> и поставь всё предложенное, включая <code>gopls</code>.',
  'Включи форматирование при сохранении в <code>settings.json</code> (фрагмент ниже).',
  'Открой папку с модулем (с файлом <code>go.mod</code>), а не отдельный файл: тогда gopls видит весь проект.']],
 ['code',`{
  "editor.formatOnSave": true,
  "[go]": {
    "editor.defaultFormatter": "golang.go",
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  }
}`],
 ['ul',[
  '<code>formatOnSave</code> запускает форматирование при каждом сохранении, и <code>go fmt</code> руками почти не нужен.',
  '<code>organizeImports</code> убирает неиспользуемые импорты и сортирует остальные: это избавляет от ошибки «imported and not used».',
  'Другие редакторы (GoLand, Neovim, Zed и т.д.) собраны в ' + A('https://go.dev/wiki/IDEsAndTextEditorPlugins','вики Go')+'. У всех под капотом тот же gopls.']],
 ['h','4. Практика и чек-лист'],
 ['ol',[
  'Намеренно испорти отступы в программе и выполни <code>gofmt -l .</code>, затем <code>gofmt -d .</code>, затем <code>go fmt ./...</code>.',
  'Воспроизведи пример с <code>%s</code> и числом, запусти программу и <code>go vet ./...</code>, объясни сообщение своими словами.',
  'Настрой VS Code по инструкции выше и проверь: сохрани файл с кривыми отступами, и они должны выровняться сами.',
  'Сделай привычкой цепочку перед коммитом: <code>go fmt ./...</code>, <code>go vet ./...</code>, <code>go build ./...</code>.']],
 ['src',[
  ['Документация gofmt (cmd/gofmt)','https://pkg.go.dev/cmd/gofmt','Флаги и поведение форматтера','en'],
  ['Документация vet (cmd/vet)','https://pkg.go.dev/cmd/vet','Список всех проверок go vet','en'],
  ['Effective Go: Formatting','https://go.dev/doc/effective_go#formatting','Правила стиля и почему табы','en'],
  ['gofmt: форматирование кода (блог Go)','https://go.dev/blog/gofmt','Зачем в Go один обязательный стиль','en'],
  ['VS Code: Go','https://code.visualstudio.com/docs/languages/go','Официальная инструкция по настройке редактора','en'],
  ['gopls: языковой сервер Go','https://go.dev/gopls/','Что умеет gopls и как его настраивать','en'],
  ['Редакторы и IDE для Go (вики)','https://go.dev/wiki/IDEsAndTextEditorPlugins','Варианты для разных редакторов','en']]]],
 q:[["Что ловит vet, чего не ловит компилятор?","Подозрительные конструкции, например неверный тип под %s в Printf."],["Меняет ли go fmt смысл программы?","Нет, только оформление."],["Чем отличается gofmt -l от gofmt -d?","-l перечисляет файлы, -d показывает, что именно изменится. Оба не меняют файлы."],["Что делает расширение Go в VS Code под капотом?","Запускает языковой сервер gopls: подсказки, форматирование, импорты."],["Что значит сообщение main.go:7:17: ...?","Файл main.go, строка 7, колонка 17, дальше описание проблемы."]],
 l:[["doc","Документация gofmt","https://pkg.go.dev/cmd/gofmt","en"],["doc","Документация vet","https://pkg.go.dev/cmd/vet","en"],["doc","Effective Go: Formatting","https://go.dev/doc/effective_go#formatting","en"],["art","gofmt (блог Go)","https://go.dev/blog/gofmt","en"],["doc","VS Code: Go","https://code.visualstudio.com/docs/languages/go","en"],["doc","gopls: языковой сервер","https://go.dev/gopls/","en"],["doc","Редакторы и IDE для Go","https://go.dev/wiki/IDEsAndTextEditorPlugins","en"],["art","go vet vs gofmt vs golint","https://sparkbox.com/foundry/go_vet_gofmt_golint_to_code_check_in_Go","en"]]},

"s1-0":{b:[
 ['p','Переменная, которой не дали значение, <b>не пустая и не undefined</b>. Go сразу кладёт в неё zero value своего типа.'],
 ['tbl',['Тип','Zero value'],[['<code>int</code>, <code>float64</code>','0'],['<code>string</code>','"" (пустая строка)'],['<code>bool</code>','false'],['указатель, срез, map','nil']]],
 ['code','var age int\nvar name string\nvar active bool\nvar price float64\ncity := "Москва"   // короткая запись: объявить и сразу задать\nvar p *int\nvar s []int\nvar m map[string]int\nfmt.Println(age, name == "", active, price, city, p == nil, s == nil, m == nil)'],
 ['out','0 true false 0 Москва true true true'],
 ['ul',['<code>var x int</code> — объявление с типом, значение zero.','<code>x := 5</code> — короткая запись, работает только внутри функции, тип выводится сам.','Объявленная и неиспользованная переменная — ошибка компиляции.']],
 ['warn','Для TypeScript-мозга: в Go нет undefined. Поэтому поле, которого не было в запросе, придёт как 0 или "", и отличить «не прислали» от «прислали ноль» без доп. средств нельзя.']],
 q:[["Чему равна var f float64 без присваивания?","0."],["Где можно использовать :=?","Только внутри функций."]],
 l:[["art","Переменные и константы в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/how-to-use-variables-and-constants-in-go-ru","ru"],["art","Типы данных в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/understanding-data-types-in-go-ru","ru"],["art","10 главных конструкций Go","https://thecode.media/10-go","ru"],["video","Tproger: урок 1, основы и первое приложение","https://tproger.ru/video/uchimsja-razrabatyvat-na-golang-urok-1-osnovy-jazyka-pervoe-prilozhenie-i-veb-server-v-3-stroki","ru"],["doc","Go by Example: Variables","https://gobyexample.com/variables","en"]]},
"s1-1":{b:[
 ['p','Go <b>не приводит типы сам</b>. Хочешь сложить <code>int</code> и <code>int64</code> — приведи явно. Запись: <code>Тип(значение)</code>.'],
 ['code','a := 7\nb := 2\nfmt.Println(a / b)                       // деление целых\nfmt.Println(float64(a) / float64(b))      // сначала привели\nvar f float64 = 9.99\nfmt.Println(int(f))                       // дробная часть отбрасывается\nvar x int64 = 5\ny := int(x) + a\nfmt.Println(y)'],
 ['out','3\n3.5\n9\n12'],
 ['ul',['<code>7 / 2</code> для целых даёт 3: остаток отбрасывается.','<code>int(9.99)</code> даёт 9, округления нет.','Строка в число: <code>strconv.Atoi("42")</code>, возвращает число и ошибку.']],
 ['warn','Ошибка <code>mismatched types int and int64</code> значит: типы у операндов разные, приведи один к другому.']],
 q:[["Что напечатает fmt.Println(7 / 2)?","3, целочисленное деление."],["Как сложить int и int64?","Привести один к типу другого: int(x) + a."]],
 l:[["art","Типы данных в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/understanding-data-types-in-go-ru","ru"],["doc","Go by Example","https://gobyexample.com","en"]]},
"s1-2":{b:[
 ['p','<code>const</code> — значение, которое нельзя изменить. <code>iota</code> — счётчик внутри блока <code>const</code>: 0, 1, 2 и так далее. Так в Go описывают наборы статусов вместо enum.'],
 ['code','type Status int\n\nconst (\n\tCreated Status = iota // 0\n\tPaid                  // 1\n\tShipped               // 2\n\tDone                  // 3\n)\n\nfunc (s Status) String() string {\n\treturn [...]string{"created", "paid", "shipped", "done"}[s]\n}\n\nfmt.Println(Created, Paid, Shipped, Done)\nfmt.Printf("%d %v\\n", Shipped, Shipped)'],
 ['out','created paid shipped done\n2 shipped'],
 ['p','Метод <code>String()</code> пока просто примета: Println сам вызывает его для вывода красивого имени. Про методы будет в этапе 2.']],
 q:[["Какое значение у Paid в примере?","1."],["Зачем отдельный тип Status, а не просто int?","Компилятор не даст перепутать статус с обычным числом, и к типу можно привязать методы."]],
 l:[["doc","Go by Example: Constants","https://gobyexample.com/constants","en"],["art","Переменные и константы в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/how-to-use-variables-and-constants-in-go-ru","ru"]]},
"s1-3":{b:[
 ['p','Скобок вокруг условия нет, фигурные скобки обязательны. Особенность Go: в <code>if</code> можно объявить переменную, которая живёт <b>только внутри этого if</b>.'],
 ['code','if n, err := strconv.Atoi("42"); err == nil {\n\tfmt.Println("число", n)\n} else {\n\tfmt.Println("ошибка", err)\n}\n\nscore := 77\nswitch {\ncase score >= 90:\n\tfmt.Println("A")\ncase score >= 70:\n\tfmt.Println("B")\ndefault:\n\tfmt.Println("C")\n}\n\nswitch d := "sat"; d {\ncase "sat", "sun":\n\tfmt.Println("выходной")\ndefault:\n\tfmt.Println("будний")\n}'],
 ['out','число 42\nB\nвыходной'],
 ['ul',['<code>switch</code> без выражения — цепочка условий, срабатывает первое подошедшее.','Проваливания на следующий case нет (в отличие от JS), <code>break</code> писать не нужно.','Несколько значений в одном case через запятую.']],
 ['warn','Шаблон <code>if err != nil { return err }</code> ты будешь писать тысячи раз. Он и есть «ветвление» backend-кода.']],
 q:[["Видна ли n за пределами if из примера?","Нет, область видимости только блок if/else."],["Нужен ли break в switch?","Нет, case не проваливается дальше."]],
 l:[["art","Условные операторы в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/how-to-write-conditional-statements-in-go-ru","ru"],["art","Оператор switch в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/how-to-write-switch-statements-in-go-ru","ru"],["art","10 главных конструкций Go","https://thecode.media/10-go","ru"],["video","Tproger: урок 2, циклы, ветвления, defer","https://tproger.ru/video/uchimsja-razrabatyvat-na-golang-urok-2-cikly-vetvlenija-operator-defer","ru"]]},
"s1-4":{b:[
 ['p','В Go один цикл — <code>for</code>, у него три формы.'],
 ['code','for i := 0; i < 3; i++ { fmt.Print(i, " ") }   // классический\n\nnums := []int{10, 20, 30}\nsum := 0\nfor i, v := range nums {                           // по срезу: индекс и значение\n\tfmt.Println(i, v)\n\tsum += v\n}\n\nn := 0\nfor n < 3 { n++ }                                  // «while»\n\nfor i, r := range "Привет" {                       // по строке\n\tfmt.Print(i, ":", string(r), " ")\n}'],
 ['out','0 1 2 \n0 10\n1 20\n2 30\n0:П 2:р 4:и 6:в 8:е 10:т '],
 ['ul',['Если индекс не нужен — <code>for _, v := range nums</code>. Подчёркивание значит «значение не используем».','Индексы у строки идут 0, 2, 4…: кириллическая буква занимает 2 байта. Подробнее в теме про руны.','С Go 1.22 доступно <code>for i := range 3</code>.','<code>break</code> выходит из цикла, <code>continue</code> переходит к следующему шагу.']]],
 q:[["Как записать цикл «пока условие»?","for условие { ... }"],["Что даёт range по срезу?","Пару: индекс и значение элемента."]],
 l:[["art","Циклы for в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/how-to-construct-for-loops-in-go-ru","ru"],["art","break и continue в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/using-break-and-continue-statements-when-working-with-loops-in-go-ru","ru"],["video","Tproger: урок 2, циклы, ветвления, defer","https://tproger.ru/video/uchimsja-razrabatyvat-na-golang-urok-2-cikly-vetvlenija-operator-defer","ru"],["doc","Go by Example: For","https://gobyexample.com/for","en"]]},
"s1-5":{b:[
 ['p','Функция в Go может вернуть несколько значений. Так устроена вся обработка ошибок: последним возвращают <code>error</code>.'],
 ['code','func divide(a, b float64) (float64, error) {\n\tif b == 0 {\n\t\treturn 0, errors.New("деление на ноль")\n\t}\n\treturn a / b, nil\n}\n\nr, err := divide(10, 4)\nfmt.Println(r, err)\nr, err = divide(1, 0)\nfmt.Println(r, err)'],
 ['out','2.5 <nil>\n0 деление на ноль'],
 ['ul',['<code>nil</code> в ошибке значит «всё хорошо».','Неиспользуемый результат можно отбросить через <code>_</code>, но ошибку так выбрасывать нельзя без причины.','Аргументы передаются <b>копией</b>: изменение параметра внутри функции не трогает оригинал. Это ровно ошибка из диагностики, подробно в теме «Указатели».']]],
 q:[["Что значит err == nil?","Ошибки нет."],["Изменит ли функция число, переданное ей как int?","Нет, она получит копию."]],
 l:[["art","Определение и вызов функций в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/how-to-define-and-call-functions-in-go-ru","ru"],["video","Tproger: урок 2, именованные возвращаемые параметры","https://tproger.ru/video/uchimsja-razrabatyvat-na-golang-urok-2-cikly-vetvlenija-operator-defer","ru"],["doc","Go by Example: Multiple Return Values","https://gobyexample.com/multiple-return-values","en"]]},
"s1-6":{b:[
 ['p','Переменная живёт в своём блоке <code>{ }</code>. Если во внутреннем блоке написать <code>:=</code> с уже существующим именем, создастся <b>новая</b> переменная, а старая останется как была. Это затенение (shadowing).'],
 ['code','x := 1\nif true {\n\tx := 2   // новая x\n\tx++\n\tfmt.Println("внутри", x)\n}\nfmt.Println("снаружи", x)'],
 ['out','внутри 3\nснаружи 1'],
 ['p','Опасный случай — затенение ошибки:'],
 ['code','func run() error {\n\tvar err error\n\tif true {\n\t\t_, err := load() // новая err, внешняя осталась nil\n\t\t_ = err\n\t}\n\treturn err // вернётся nil, хотя load упала\n}'],
 ['out','run вернул: <nil>'],
 ['warn','Лечение: использовать <code>=</code> вместо <code>:=</code>, если нужна уже объявленная переменная.']],
 q:[["Что значит := во внутреннем блоке с тем же именем?","Создаёт новую переменную, внешняя не меняется."],["Почему в run() ошибка потерялась?","err внутри if была новой, return вернул внешнюю, которая осталась nil."]],
 l:[["art","10 главных конструкций Go","https://thecode.media/10-go","ru"],["doc","Go by Example","https://gobyexample.com","en"]]},
"s1-7":{b:[
 ['p','O-нотация отвечает на вопрос: <b>как растёт число шагов, когда данных становится больше</b>. Не секунды, а форма роста.'],
 ['tbl',['Запись','Название','Пример'],[['O(1)','константа','взять элемент среза по индексу, прочитать из map'],['O(n)','линейная','пройти циклом по всему срезу'],['O(n²)','квадратичная','цикл в цикле по одним и тем же данным'],['O(log n)','логарифмическая','бинарный поиск в отсортированном срезе']]],
 ['code','// O(1)\nx := nums[0]\n\n// O(n): один проход\nfor _, v := range nums { sum += v }\n\n// O(n²): для каждого элемента проходим всех\nfor _, a := range nums {\n\tfor _, b := range nums { _ = a + b }\n}'],
 ['ul',['Константы и мелочи отбрасываем: 3n+5 — это O(n).','Берём худший случай.','Поиск в срезе — O(n), в map — в среднем O(1). Поэтому map нужен для частых проверок «есть ли такой ключ».']]],
 q:[["Какая сложность у цикла в цикле по одному срезу?","O(n²)."],["Почему поиск по ключу в map обычно лучше поиска в срезе?","В среднем O(1) против O(n)."]],
 l:[["art","Что такое сложность алгоритмов (Хабр)","https://habr.com/ru/articles/851982","ru"],["art","Оценка сложности алгоритмов, или Что такое O(log n) (Tproger)","https://tproger.ru/articles/computational-complexity-explained","ru"],["art","Асимптотический анализ простым языком (Хабр)","https://habr.com/post/78728/","ru"]]},
"s1-8":{b:[
 ['p','<b>Задача:</b> консольный конвертер, который читает значение и единицу, считает результат и выводит его. Например: км в мили, градусы Цельсия в Фаренгейты.'],
 ['ul',['Типы и приведение: вводимое число в <code>float64</code>.','Условия: <code>switch</code> по единице измерения.','Функция с двумя возвращаемыми значениями: результат и ошибка (неизвестная единица).','Константы для коэффициентов.','Цикл: повторять, пока пользователь не введёт «выход».']],
 ['warn','Сначала нарисуй схему: что вводится → что проверяется → что считается → что выводится. Только потом код. Решения здесь нет намеренно: это твоя попытка.']],
 q:[["Что вернёт твоя функция при неизвестной единице?","Ошибку (второе значение), результат не используется."],["Где в программе нужно приведение типов?","Там, где число из ввода участвует в расчёте с float64."]],
 l:[["doc","Go by Example","https://gobyexample.com","en"],["course","Stepik: Go на примерах","https://stepik.org/217979","ru"]]},

"s2-0":{b:[
 ['p','<b>Проблема.</b> Функция получает <i>копию</i> аргумента, поэтому изменить оригинал внутри неё нельзя. Указатель — это значение, которое хранит <b>адрес</b> ячейки памяти. Передав адрес, мы даём функции доступ к оригиналу.'],
 ['code','func resetCopy(n int) { n = 0 }\nfunc resetPtr(n *int)  { *n = 0 }\n\na := 5\nresetCopy(a)\nfmt.Println(a)    // ?\nresetPtr(&a)\nfmt.Println(a)    // ?'],
 ['out','5\n0'],
 ['mem',['Строка','Что в памяти'],[['<code>a := 5</code>','a = 5'],['<code>resetCopy(a)</code>','создана копия n = 5, n = 0 меняет копию, копия исчезла; a = 5'],['<code>resetPtr(&a)</code>','&a — адрес a; n хранит этот адрес; *n = 0 идёт по адресу и меняет a'],['после','a = 0']]],
 ['ul',['<code>&x</code> — взять адрес переменной, <code>*p</code> — перейти по адресу к значению.','Указатель без адреса — <code>nil</code>. Разыменовать <code>nil</code> нельзя: паника.','Тип указателя на int записывается <code>*int</code>.','Для структур Go сам разыменует: <code>u.Name</code> работает и для <code>*User</code>.']],
 ['code','type User struct{ Name string }\nfunc renameCopy(u User)  { u.Name = "X" }\nfunc renamePtr(u *User)  { u.Name = "X" }\n\nu := User{"Аня"}\nrenameCopy(u)\nfmt.Println(u.Name)\nrenamePtr(&u)\nfmt.Println(u.Name)'],
 ['out','Аня\nX'],
 ['warn','Типичная ошибка: ждать, что функция изменит структуру, которую получила по значению. Это та самая задача <code>reset(obj)</code> из диагностики.']],
 q:[["Что напечатает программа после resetCopy(a), если a = 5?","5: функция меняет копию."],["Что делает *p = 11, если p = &b?","Записывает 11 в b: b тоже станет 11."],["Что будет при разыменовании nil-указателя?","Паника."]],
 l:[["art","Указатели в Go: Dave Cheney, перевод (Хабр)","https://habr.com/ru/post/956040","ru"],["art","Указатели в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/understanding-pointers-in-go","en"],["art","Pointers explained (programming.guide)","https://programming.guide/go/pointers-explained.html","en"],["art","Go 101: Pointers","https://go101.org/article/pointer.html","en"],["doc","Go by Example: Pointers","https://gobyexample.com/pointers","en"]]},
"s2-1":{b:[
 ['p','<b>Срез</b> — не сам список, а «окно» в массив: три поля — указатель на массив, <code>len</code> (сколько видно) и <code>cap</code> (сколько места до конца массива). Поэтому срезы могут делить одну память.'],
 ['code','a := []int{1, 2, 3, 4}\nb := a[:2]\nb[0] = 99\nfmt.Println(a, b, len(b), cap(b))\nb = append(b, 7)\nfmt.Println(a, b)'],
 ['out','[99 2 3 4] [99 2] 2 4\n[99 2 7 4] [99 2 7]'],
 ['mem',['Шаг','Что произошло'],[['<code>b := a[:2]</code>','b смотрит на тот же массив, len 2, cap 4'],['<code>b[0] = 99</code>','меняется общий массив, a тоже видит 99'],['<code>append(b, 7)</code>','места хватает (cap 4), 7 записывается в третью ячейку общего массива и затирает 3']]],
 ['code','c := make([]int, 0, 2)\nc = append(c, 1, 2)\nd := append(c, 3) // cap 2 не хватило: новый массив\nd[0] = 100\nfmt.Println(c, d)\n\ne := make([]int, len(a))\ncopy(e, a)       // независимая копия\ne[0] = -1\nfmt.Println(a, e)'],
 ['out','[1 2] [100 2 3]\n[99 2 7 4] [-1 2 7 4]'],
 ['ul',['Когда <code>cap</code> заканчивается, <code>append</code> создаёт новый больший массив и копирует туда данные. Связь со старым срезом рвётся.','Результат <code>append</code> всегда присваивай обратно: <code>s = append(s, x)</code>.','Хочешь независимую копию — <code>copy</code> в новый срез нужной длины.','Массив <code>[3]int</code> имеет фиксированную длину и копируется целиком, срез — нет.']],
 ['warn','Если после изменения одного среза «задело» другой — ищи общий массив: оба среза смотрят на одну память.']],
 q:[["Почему a изменился после b[0] = 99?","b и a смотрят на один и тот же массив."],["Когда append создаёт новый массив?","Когда len дошла до cap и места не хватает."],["Как сделать срез, независимый от a?","Через make нужной длины и copy."]],
 l:[["art","Go Slices: usage and internals","https://go.dev/blog/slices-intro","en"],["art","Массивы и срезы в Go (Хабр)","https://habr.com/en/articles/739754","ru"],["art","Как растёт срез в Go (Хабр)","https://habr.com/ru/articles/874480","ru"],["art","Срезы в Go (Хабр)","https://habr.com/en/articles/597521","ru"]]},
"s2-2":{b:[
 ['p','<b>Map</b> — таблица «ключ → значение» с быстрым поиском. При чтении отсутствующего ключа вернётся zero value, поэтому отличить «нет ключа» от «значение 0» помогает вторая переменная <code>ok</code>.'],
 ['code','m := map[string]int{"a": 1}\nv, ok := m["b"]\nfmt.Println(v, ok)\nm["b"]++\nfmt.Println(m)\n\ncounts := map[string]int{}\nfor _, w := range strings.Fields("go is go and go") {\n\tcounts[w]++\n}\nfmt.Println(counts)\ndelete(counts, "is")\nfmt.Println(len(counts))'],
 ['out','0 false\nmap[a:1 b:1]\nmap[and:1 go:3 is:1]\n2'],
 ['ul',['Порядок обхода map <b>случайный</b>. Нужен порядок — сортируй ключи отдельно.','Чтение из <code>nil</code>-map безопасно, <b>запись</b> — паника.','Map — ссылочный тип: при передаче в функцию копируется «ручка», данные общие.']],
 ['code','var nilMap map[string]int\nfmt.Println(nilMap["x"]) // 0\nnilMap["x"] = 1          // паника'],
 ['out','0\nпаника: assignment to entry in nil map'],
 ['warn','Перед записью создавай map: <code>make(map[string]int)</code> или литерал <code>map[string]int{}</code>.']],
 q:[["Что вернёт m[\"zzz\"] для map[string]int?","0, причём ok будет false."],["Можно ли писать в nil-map?","Нет, паника. Читать можно."]],
 l:[["art","Карты (map) в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/understanding-maps-in-go-ru","ru"],["art","Как устроена map в Go (Хабр)","https://habr.com/en/articles/457728","ru"],["art","Swiss Tables в Go 1.24 (Хабр)","https://habr.com/ru/articles/899180","ru"],["art","Maps explained (yourbasic)","https://yourbasic.org/golang/maps-explained/","en"],["doc","Go by Example: Maps","https://gobyexample.com/maps","en"]]},
"s2-3":{b:[
 ['p','Строка в Go — последовательность <b>байт</b> в кодировке UTF-8. Латинская буква занимает 1 байт, кириллическая — 2. <code>rune</code> — один символ Unicode (по сути <code>int32</code>).'],
 ['code','s := "Привет"\nfmt.Println(len(s), len([]rune(s)))\nfmt.Println(s[0])\n\nfunc reverse(s string) string {\n\tr := []rune(s)\n\tfor i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {\n\t\tr[i], r[j] = r[j], r[i]\n\t}\n\treturn string(r)\n}\nfmt.Println(reverse(s))'],
 ['out','12 6\n208\nтевирП'],
 ['ul',['<code>len(s)</code> считает байты, число символов — <code>len([]rune(s))</code>.','<code>s[0]</code> даёт байт (число), а не букву.','Строки неизменяемы: чтобы поменять символы, переведи в <code>[]rune</code>.','<code>range</code> по строке отдаёт руны с байтовыми индексами.']],
 ['warn','Разворот строки через <code>[]byte</code> порвёт кириллицу. Всегда <code>[]rune</code>, если в тексте не только латиница.']],
 q:[["Почему len(\"Привет\") = 12?","Каждая кириллическая буква занимает 2 байта в UTF-8."],["Как перевернуть строку с кириллицей?","Через []rune: поменять элементы местами, собрать обратно в string."]],
 l:[["art","Strings, bytes, runes and characters in Go","https://go.dev/blog/strings","en"],["doc","Go by Example: Strings and Runes","https://gobyexample.com/strings-and-runes","en"]]},
"s2-4":{b:[
 ['p','<b>Структура</b> группирует поля в один тип: пользователь, заказ, закладка. Это твои модели данных.'],
 ['code','type Address struct{ City string }\ntype User struct {\n\tName string\n\tAge  int\n\tAddress          // встроенная структура\n}\n\nu := User{Name: "Аня", Age: 20}\nfmt.Printf("%v\\n%+v\\n", u, u)\nu.City = "Казань"\nv := u            // копия целиком\nv.Name = "Оля"\nfmt.Println(u.Name, v.Name, u.Address.City)\nvar z User\nfmt.Printf("%+v\\n", z)'],
 ['out','{Аня 20 {}}\n{Name:Аня Age:20 Address:{City:}}\nАня Оля Казань\n{Name: Age:0 Address:{City:}}'],
 ['ul',['Создание: <code>User{Name: "Аня"}</code> с именами полей, остальные станут zero value.','Присваивание структуры копирует её целиком.','<code>%+v</code> печатает имена полей, удобно при отладке.','Поля с заглавной буквы видны другим пакетам, со строчной — нет.']]],
 q:[["Изменится ли u.Name после v := u; v.Name = \"Оля\"?","Нет, v — полная копия."],["Что у var z User в поле Age?","0, zero value."]],
 l:[["art","Определение структур в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/defining-structs-in-go-ru","ru"],["doc","Go by Example: Structs","https://gobyexample.com/structs","en"]]},
"s2-5":{b:[
 ['p','<b>Метод</b> — функция, привязанная к типу. Перед именем указывают получателя. Он бывает <b>по значению</b> (получит копию) или <b>по указателю</b> (получит доступ к оригиналу).'],
 ['code','type Counter struct{ n int }\n\nfunc (c Counter) IncValue()  { c.n++ }   // копия\nfunc (c *Counter) IncPtr()   { c.n++ }   // оригинал\nfunc (c Counter) Value() int { return c.n }\n\nc := Counter{}\nc.IncValue()\nfmt.Println(c.Value())\nc.IncPtr()\nc.IncPtr()\nfmt.Println(c.Value())'],
 ['out','0\n2'],
 ['ul',['Метод должен менять структуру → получатель по указателю.','Только читает и структура маленькая → можно по значению.','Если у типа есть хоть один метод с указателем, остальным тоже ставят указатель: так предсказуемее.','Вызывать можно одинаково: Go сам возьмёт адрес (<code>c.IncPtr()</code> при переменной <code>c</code>).']],
 ['warn','Вопрос «почему метод не изменил структуру» почти всегда ответ: получатель по значению.']],
 q:[["Почему IncValue не изменил c?","Получатель по значению — метод работает с копией."],["Когда выбирать получатель по указателю?","Когда метод меняет данные или структура большая."]],
 l:[["art","Определение методов в Go (DigitalOcean)","https://www.digitalocean.com/community/tutorials/defining-methods-in-go-ru","ru"],["art","Value vs pointer: семантика в Go (Хабр)","https://habr.com/en/articles/469859/","ru"],["art","Выбор типа получателя (Coddy)","https://coddy.tech/learn/ru/go/logic_and_flow/choosing_receivers","ru"],["art","Value vs Pointer Receivers (AlgoMaster)","https://algomaster.io/learn/go/value-vs-pointer-receivers","en"]]},
"s2-6":{b:[
 ['p','<b>Задача:</b> консольный список задач. Команды: добавить, показать, отметить выполненной, удалить.'],
 ['ul',['Структура <code>Task</code>: ID, название, готово или нет.','Срез задач и map «ID → индекс» для быстрого поиска.','Тип <code>TaskList</code> с методами <code>Add</code>, <code>Done</code>, <code>Remove</code>: подумай, какой получатель нужен каждому и почему.','Ошибка, если ID не найден (вспомни <code>ok</code> из map).']],
 ['warn','Пока не пиши код. Нарисуй схему: какие данные хранятся, какие команды что меняют. Решения здесь нет намеренно.']],
 q:[["Почему Add нужен получатель по указателю?","Он меняет срез внутри структуры, а копия потеряла бы изменение."],["Что вернёт Done при несуществующем ID?","Ошибку."]],
 l:[["course","Stepik: Go на примерах","https://stepik.org/217979","ru"],["doc","Go by Example","https://gobyexample.com","en"]]}
};

// Подключает расширенные конспекты (js/notes-*.js): блоки заменяются, ссылки дополняются старыми
function mergeNotes(N){
 Object.keys(N).forEach(id=>{
  const old=TOPIC_DATA[id]||{b:[],q:[],l:[]},n=N[id];
  const urls=new Set((n.l||[]).map(x=>x[2]));
  TOPIC_DATA[id]={b:n.b,q:n.q||old.q,l:(n.l||[]).concat((old.l||[]).filter(x=>!urls.has(x[2])))};
 });
}
// «§» в примерах кода означает обратную кавычку (чтобы не экранировать в шаблонных строках)
function fixTicks(){Object.values(TOPIC_DATA).forEach(d=>d.b.forEach(b=>{if(b[0]==='code'||b[0]==='out')b[1]=b[1].replace(/§/g,'`')}))}
