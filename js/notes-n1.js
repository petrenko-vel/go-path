// Конспекты: time, flag, slices и maps, strings.Builder и bytes (номера тем по новой карте). «§» в коде означает обратную кавычку.
mergeNotes({
"s1-7":{b:[
 ['p',`Время в программировании делится на две вещи, которые часто путают: <b>момент</b> («17 ноября 2026, 18:30») и <b>промежуток</b> («50 минут»). В Go это два разных типа: <code>time.Time</code> и <code>time.Duration</code>. Почти каждая задача с датами, сроками, тайм-аутами и логами опирается на пакет ${A('https://pkg.go.dev/time','time')}, а ошибки в нём (особенно с форматом и часовыми поясами) одни из самых частых.`],
 ['real',5,'каждый день',[
  '<b>Тайм-ауты и сроки:</b> <code>5 * time.Second</code> для запроса к базе, срок жизни токена, срок хранения кэша.',
  '<b>Даты в данных:</b> время создания и обновления записи, фильтры «за последнюю неделю», отчёты по дням.',
  '<b>JSON и база:</b> <code>time.Time</code> превращается в строку RFC 3339 и обратно, это формат почти каждого API.',
  '<b>Измерения:</b> <code>time.Since(start)</code> в логах «обработано за 12ms» и в метриках задержек.',
  '<b>Планировщики и повторы:</b> таймеры, тикеры, паузы между попытками.']],
 ['case','Срок действия токена и «сколько осталось»',[
  '<p>Пользователь вошёл в 18:30, токен живёт 50 минут. Конец срока это <code>start.Add(50 * time.Minute)</code>, оставшееся время это <code>expires.Sub(now)</code>, а проверка «ещё жив» это <code>now.Before(expires)</code>. Все три операции ниже. И запомни главное правило: <b>время хранят и передают в UTC</b>, а в местное переводят только для показа человеку.</p>']],
 ['h','1. Time и Duration: что есть что'],
 ['tbl',['Тип','Что это','Пример'],[
  ['<code>time.Time</code>','Момент времени (с часовым поясом)','<code>time.Date(2026, 11, 17, 18, 30, 0, 0, time.UTC)</code>'],
  ['<code>time.Duration</code>','Промежуток в наносекундах (число типа int64)','<code>90 * time.Minute</code>, <code>time.Second</code>'],
  ['<code>time.Month</code>, <code>time.Weekday</code>','Месяц и день недели с названиями','<code>time.November</code>, <code>time.Tuesday</code>']]],
 ['h','2. Формат даты: эталон 2006-01-02 15:04:05'],
 ['p','В Go формат не пишут кодами вроде <code>%Y-%m-%d</code>. Вместо этого берут <b>эталонную дату</b> и записывают в нужном виде её: понедельник, 2 января 2006, 15:04:05, часовой пояс MST (это -0700). Запомнить проще по порядку чисел: <code>01/02 03:04:05PM \'06 -0700</code> это 1, 2, 3, 4, 5, 6, 7.'],
 ['tbl',['Кусок формата','Значение'],[
  ['<code>2006</code>, <code>06</code>','Год из четырёх и двух цифр'],
  ['<code>01</code>, <code>1</code>, <code>Jan</code>, <code>January</code>','Месяц числом, без нуля, коротко и полностью (названия английские)'],
  ['<code>02</code>, <code>2</code>','День месяца с нулём и без'],
  ['<code>15</code>, <code>03</code>, <code>PM</code>','Час в 24-часовом и 12-часовом формате'],
  ['<code>04</code>, <code>05</code>','Минуты и секунды'],
  ['<code>Mon</code>, <code>Monday</code>','День недели (английский)'],
  ['<code>MST</code>, <code>-0700</code>, <code>Z07:00</code>','Часовой пояс']]],
 ['code',`package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Date(2026, time.November, 17, 18, 30, 0, 0, time.UTC)
	fmt.Println(t.Format("2006-01-02 15:04:05"))
	fmt.Println(t.Format("02.01.2006 15:04"))
	fmt.Println(t.Format(time.RFC3339))
	fmt.Println(t.Weekday(), t.YearDay(), t.Month(), t.Unix())

	parsed, err := time.Parse("02.01.2006", "25.12.2026")
	fmt.Println(parsed.Format("2 January 2006"), err)

	_, err = time.Parse("2006-01-02", "2026-13-40")
	fmt.Println(err)
}`],
 ['out',`2026-11-17 18:30:00
17.11.2026 18:30
2026-11-17T18:30:00Z
Tuesday 321 November 1794940200
25 December 2026 <nil>
parsing time "2026-13-40": month out of range`],
 ['code',`package main

import (
	"fmt"
	"time"
)

func main() {
	ref := time.Date(2006, 1, 2, 15, 4, 5, 0, time.FixedZone("MST", -7*3600))
	fmt.Println(ref.Format("01/02 03:04:05PM '06 -0700"))
	fmt.Println(ref.Format(time.RFC1123))
	t := time.Date(2026, 11, 17, 9, 5, 0, 0, time.UTC)
	fmt.Println(t.Format(time.DateOnly), t.Format(time.TimeOnly), t.Format(time.Kitchen))
	fmt.Println(t.Format("Mon, 2 Jan 06"), t.Format("Monday, January 2"))
}`],
 ['out',`01/02 03:04:05PM '06 -0700
Mon, 02 Jan 2006 15:04:05 MST
2026-11-17 09:05:00 9:05AM
Tue, 17 Nov 26 Tuesday, November 17`],
 ['ul',[
  'Эталон форматируется сам в себя: первая строка вывода совпадает с самим форматом. Это хороший способ проверить, что ты запомнила порядок.',
  'Готовые константы: <code>time.RFC3339</code> (для API и JSON), <code>time.DateOnly</code>, <code>time.TimeOnly</code>, <code>time.DateTime</code>, <code>time.Kitchen</code> (<code>9:05AM</code>).',
  '<b>Названия месяцев и дней всегда английские.</b> Русские придётся подставлять своей таблицей: <code>[]string{"января", "февраля", ...}</code>.',
  '<code>time.Parse</code> возвращает ошибку, если строка не подходит под формат. Её всегда проверяют: пользовательский ввод ошибается постоянно.']],
 ['h','3. Duration: промежутки'],
 ['code',`package main

import (
	"fmt"
	"time"
)

func main() {
	d := 90 * time.Minute
	fmt.Println(d, d.Hours(), d.Minutes())

	timeout := 5 * time.Second
	fmt.Println(timeout, time.Duration(2500)*time.Millisecond)

	n := 3
	fmt.Println(time.Duration(n) * time.Second)

	d2, err := time.ParseDuration("1h15m30s")
	fmt.Println(d2, d2.Seconds(), err)

	fmt.Println(time.Duration(2)) // забыли единицу: это 2 наносекунды
}`],
 ['out',`1h30m0s 1.5 90
5s 2.5s
3s
1h15m30s 4530 <nil>
2ns`],
 ['p','<code>Duration</code> это число наносекунд. Поэтому <code>time.Sleep(2)</code> компилируется, но спит две наносекунды, а не две секунды. Единицу всегда пишут: <code>2 * time.Second</code>. Ещё одна ловушка: переменную типа <code>int</code> на константу <code>time.Second</code> напрямую не умножить.'],
 ['code',`package main

import (
	"fmt"
	"time"
)

func main() {
	n := 3
	fmt.Println(n * time.Second)
}`],
 ['out','./main.go:10:14: invalid operation: n * time.Second (mismatched types int and time.Duration)'],
 ['p','Правильно: <code>time.Duration(n) * time.Second</code>. Подробнее про эту ошибку: ' + A('https://100go.co/#providing-a-wrong-time-duration-75','100 Go Mistakes №75')+'.'],
 ['h','4. Арифметика и сравнение'],
 ['code',`package main

import (
	"fmt"
	"time"
)

func main() {
	start := time.Date(2026, 11, 17, 18, 30, 0, 0, time.UTC)
	end := start.Add(50 * time.Minute)
	fmt.Println(end.Format("15:04"), end.Sub(start), end.After(start))

	next := start.AddDate(0, 0, 7)
	fmt.Println(next.Format("2006-01-02"), next.Weekday())

	deadline := time.Date(2026, 12, 31, 0, 0, 0, 0, time.UTC)
	fmt.Println(int(deadline.Sub(start).Hours()/24), "дней до конца года")

	fmt.Println(start.Truncate(24 * time.Hour).Format(time.DateTime))
	fmt.Println(start.Before(deadline), start.Equal(start.Add(0)))
}`],
 ['out',`19:20 50m0s true
2026-11-24 Tuesday
43 дней до конца года
2026-11-17 00:00:00
true true`],
 ['tbl',['Операция','Что делает'],[
  ['<code>t.Add(d)</code>','Сдвигает момент на промежуток'],
  ['<code>a.Sub(b)</code>','Разница двух моментов: возвращает Duration'],
  ['<code>t.AddDate(y, m, d)</code>','Сдвиг в календарных единицах: месяц, неделя, год'],
  ['<code>t.Truncate(d)</code>, <code>t.Round(d)</code>','Округление вниз и до ближайшего (начало дня, часа)'],
  ['<code>a.Before(b)</code>, <code>a.After(b)</code>, <code>a.Equal(b)</code>','Сравнение моментов'],
  ['<code>t.IsZero()</code>','Время не задано (нулевое значение Time)']]],
 ['h','5. Часовые пояса'],
 ['code',`package main

import (
	"fmt"
	"time"
	_ "time/tzdata" // база часовых поясов внутри программы
)

func main() {
	msk, err := time.LoadLocation("Europe/Moscow")
	if err != nil {
		fmt.Println(err)
		return
	}
	utc := time.Date(2026, 11, 17, 15, 0, 0, 0, time.UTC)
	local := utc.In(msk)
	fmt.Println(utc.Format(time.RFC3339))
	fmt.Println(local.Format(time.RFC3339))
	fmt.Println(utc.Equal(local), utc == local)
}`],
 ['out',`2026-11-17T15:00:00Z
2026-11-17T18:00:00+03:00
true false`],
 ['ul',[
  'Это один и тот же момент, записанный в двух поясах: <code>Equal</code> говорит «да», а <code>==</code> «нет», потому что сравнивает ещё и указатель на пояс. <b>Моменты сравнивают через <code>Equal</code></b>, а не <code>==</code>.',
  '<code>time.LoadLocation("Europe/Moscow")</code> читает базу часовых поясов с компьютера. На минимальных образах Docker её нет. Импорт <code>_ "time/tzdata"</code> встраивает базу в программу, и она работает везде.',
  'Хранить и передавать время лучше в <b>UTC</b>, а переводить через <code>.In(loc)</code> только перед показом.']],
 ['h','6. Время в JSON'],
 ['code',`package main

import (
	"encoding/json"
	"fmt"
	"time"
)

type Event struct {
	Title string        §json:"title"§
	At    time.Time     §json:"at"§
	Len   time.Duration §json:"len"§
}

func main() {
	e := Event{"Созвон", time.Date(2026, 11, 17, 11, 0, 0, 0, time.UTC), 30 * time.Minute}
	b, _ := json.Marshal(e)
	fmt.Println(string(b))

	var back Event
	json.Unmarshal([]byte(§{"title":"Встреча","at":"2026-11-18T09:30:00+03:00","len":3600000000000}§), &back)
	fmt.Println(back.Title, back.At.UTC().Format(time.RFC3339), back.Len)
}`],
 ['out',`{"title":"Созвон","at":"2026-11-17T11:00:00Z","len":1800000000000}
Встреча 2026-11-18T06:30:00Z 1h0m0s`],
 ['p','<code>time.Time</code> превращается в строку RFC 3339, а <code>Duration</code> в обычное число наносекунд, что многих удивляет. Для API длительность обычно отдают в секундах или миллисекундах отдельным полем.'],
 ['h','7. Измерение времени и таймеры'],
 ['code',`package main

import (
	"fmt"
	"time"
)

func main() {
	start := time.Now()
	time.Sleep(20 * time.Millisecond)
	took := time.Since(start)
	fmt.Println(took >= 20*time.Millisecond, took < time.Second)

	// сравнение моментов: Equal, а не ==
	a := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	b := a.In(time.FixedZone("X", 3*3600))
	fmt.Println(a == b, a.Equal(b))
}`],
 ['out',`true true
false true`],
 ['p','<code>time.Now()</code> хранит ещё и показания <b>монотонных часов</b>: они не прыгают при переводе времени в системе. Поэтому длительность меряют так: <code>start := time.Now()</code> и дальше <code>time.Since(start)</code>. Эта разница не зависит от того, что кто-то поменял системные часы.'],
 ['code',`package main

import (
	"fmt"
	"time"
)

func main() {
	done := make(chan string)
	go func() {
		time.Sleep(50 * time.Millisecond)
		done <- "ответ получен"
	}()

	select {
	case r := <-done:
		fmt.Println(r)
	case <-time.After(time.Second):
		fmt.Println("таймаут")
	}

	never := make(chan string)
	select {
	case r := <-never:
		fmt.Println(r)
	case <-time.After(30 * time.Millisecond):
		fmt.Println("таймаут")
	}
}`],
 ['out',`ответ получен
таймаут`],
 ['p','Это забегание вперёд: горутины и <code>select</code> будут в этапе про конкурентность. Запомни пока идею: «ждём ответ, но не дольше секунды». Внутри циклов вместо <code>time.After</code> лучше <code>time.NewTimer</code> с <code>Stop</code>, о причине написано в ' + A('https://100go.co/#timeafter-and-memory-leaks-76','100 Go Mistakes №76')+'. Для сложной отмены используют <code>context.WithTimeout</code> (тема этапа 5).'],
 ['h','8. Как тестировать код со временем'],
 ['p','Если логика вызывает <code>time.Now()</code> прямо в теле, тест зависит от настоящих часов и «мигает». Принятая практика: передавать источник времени как зависимость.'],
 ['code',`package main

import (
	"fmt"
	"time"
)

// Clock подменяют в тестах: логика не вызывает time.Now() напрямую
type Clock func() time.Time

func isExpired(expires time.Time, now Clock) bool {
	return !now().Before(expires)
}

func main() {
	expires := time.Date(2026, 11, 17, 12, 0, 0, 0, time.UTC)
	at := func(h, m int) Clock {
		return func() time.Time { return time.Date(2026, 11, 17, h, m, 0, 0, time.UTC) }
	}
	fmt.Println(isExpired(expires, at(11, 59)), isExpired(expires, at(12, 0)), isExpired(expires, at(12, 1)))
}`],
 ['out','false true true'],
 ['h','9. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>parsing time "...": cannot parse ...</code>','Формат не совпадает со строкой. Сверь эталон: 01 это месяц, 02 день, 15 час, 04 минуты'],
  ['<code>time.Sleep(2)</code> «не ждёт»','Это 2 наносекунды. Пиши <code>2 * time.Second</code>'],
  ['<code>mismatched types int and time.Duration</code>','Приведи число: <code>time.Duration(n) * time.Second</code>'],
  ['Даты «съезжают» на несколько часов','Перепутаны пояса. Храни UTC, переводи в местное при показе'],
  ['<code>a == b</code> для времени даёт false','Сравнивай через <code>Equal</code>'],
  ['Тест иногда падает','Внутри логики вызов <code>time.Now()</code>. Передай источник времени как параметр']]],
 ['h','10. Вопросы с собеседований'],
 ['ul',[
  '<b>Как в Go форматируют даты?</b> Через эталонную дату 2006-01-02 15:04:05: формат записывают её же цифрами.',
  '<b>Чем Time отличается от Duration?</b> Time это момент, Duration промежуток в наносекундах.',
  '<b>Почему время сравнивают через Equal?</b> <code>==</code> сравнивает и часовой пояс (указатель), момент может совпасть при разных поясах.',
  '<b>В каком поясе хранить время?</b> В UTC, а в местное переводить только для показа.']],
 ['h','11. Практика'],
 ['ol',[
  'Выведи текущую дату в формате «17 ноября 2026, вторник» с русскими названиями месяца и дня недели (свои таблицы).',
  'Посчитай, сколько дней до ближайшей пятницы от любой заданной даты.',
  'Напиши функцию <code>isWorkHour(t time.Time) bool</code> для будней с 9:00 до 18:00 и протестируй, подавая разные <code>time.Date(...)</code>.',
  'Сериализуй структуру с <code>time.Time</code> в JSON, прочитай обратно с другим поясом и проверь через <code>Equal</code>.',
  'Измерь, сколько времени занимает цикл на миллион итераций, через <code>time.Since</code>.']],
 ['src',[
  ['Пакет time (документация)','https://pkg.go.dev/time','Все функции и константы форматов, раздел про монотонные часы','en'],
  ['Go by Example: Time','https://gobyexample.com/time','Короткий обзор операций со временем','en'],
  ['Go by Example: Time Formatting / Parsing','https://gobyexample.com/time-formatting-parsing','Эталонные форматы на примерах','en'],
  ['Go by Example: Epoch','https://gobyexample.com/epoch','Unix-время в секундах и наносекундах','en'],
  ['Go by Example: Timers и Tickers','https://gobyexample.com/timers','Таймеры и тикеры','en'],
  ['Пакет time/tzdata','https://pkg.go.dev/time/tzdata','Встроенная база часовых поясов','en'],
  ['The complete guide to dates and times in Go (Honeybadger)','https://www.honeybadger.io/blog/complete-guide-to-dates-and-times-in-go','Подробный разбор формата, поясов и интервалов','en'],
  ['Time in Golang (Soham Kamani)','https://sohamkamani.com/golang/time','Практичные примеры парсинга и арифметики','en'],
  ['100 Go Mistakes: Duration и time.After','https://100go.co/#providing-a-wrong-time-duration-75','Ошибки с длительностью и утечки таймеров','en']]]],
 q:[["Как записать формат для даты 17.11.2026 18:30?","\"02.01.2006 15:04\": эталонными цифрами, 02 день, 01 месяц, 2006 год, 15 час, 04 минуты."],["Почему time.Sleep(2) почти не ждёт?","Duration считается в наносекундах: 2 это 2 наносекунды. Нужно 2 * time.Second."],["Чем Equal лучше == для времени?","Equal сравнивает момент, а == ещё и часовой пояс как указатель."],["Как правильно измерить, сколько работала функция?","start := time.Now(), потом time.Since(start): используются монотонные часы."],["Как хранить время в базе и JSON?","В UTC, в формате RFC 3339, а в местное переводить для показа."],["Зачем импорт _ \"time/tzdata\"?","Встраивает базу часовых поясов в программу: LoadLocation работает и там, где её нет в системе."]],
 l:[["doc","Пакет time (документация)","https://pkg.go.dev/time","en"],["trainer","Go by Example: Time Formatting / Parsing","https://gobyexample.com/time-formatting-parsing","en"],["art","The complete guide to dates and times in Go (Honeybadger)","https://www.honeybadger.io/blog/complete-guide-to-dates-and-times-in-go","en"],["art","Time in Golang (Soham Kamani)","https://sohamkamani.com/golang/time","en"]]},

"s1-8":{b:[
 ['p',`Любая программа, которую запускают из терминала, получает настройки через <b>аргументы командной строки</b>: <code>go build -o app .</code>, <code>git commit -m "..."</code>. В Go они лежат в <code>os.Args</code>, а пакет ${A('https://pkg.go.dev/flag','flag')} превращает их в удобные типизированные флаги с подсказкой и значениями по умолчанию.`],
 ['real',4,'часто',[
  '<b>Утилиты и скрипты</b> разработчика: миграции, генераторы, импортёры данных.',
  '<b>Сервисы</b> принимают порт, адрес базы и режим через флаги или переменные окружения.',
  '<b>Коды выхода</b> (0, 1, 2) читает CI: «программа упала или нет».',
  '<b>Крупные CLI</b> (kubectl, docker, gh) строятся на тех же идеях, но с библиотекой cobra.']],
 ['h','1. os.Args: сырой список'],
 ['code',`package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println(len(os.Args))
	for i, a := range os.Args[1:] {
		fmt.Println(i, a)
	}
}`],
 ['out','1'],
 ['p','Если запустить без аргументов, в <code>os.Args</code> один элемент: <code>os.Args[0]</code>, путь самой программы. Запуск <code>go run . a b</code> даст <code>len(os.Args) == 3</code> и цикл напечатает <code>0 a</code> и <code>1 b</code>. Индекс <code>os.Args[1]</code> без проверки длины приведёт к панике, если аргументов нет.'],
 ['h','2. Пакет flag'],
 ['code',`package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

func main() {
	fs := flag.NewFlagSet("greet", flag.ContinueOnError)
	name := fs.String("name", "мир", "кого приветствовать")
	times := fs.Int("n", 1, "сколько раз повторить")
	loud := fs.Bool("loud", false, "писать заглавными")

	// в настоящей программе: fs.Parse(os.Args[1:])
	if err := fs.Parse([]string{"-name", "Аня", "-n", "2", "-loud", "file1.txt", "file2.txt"}); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}
	for i := 0; i < *times; i++ {
		msg := "Привет, " + *name + "!"
		if *loud {
			msg = strings.ToUpper(msg)
		}
		fmt.Println(msg)
	}
	fmt.Println("остальные аргументы:", fs.Args(), fs.NArg())
}`],
 ['out',`ПРИВЕТ, АНЯ!
ПРИВЕТ, АНЯ!
остальные аргументы: [file1.txt file2.txt] 2`],
 ['ul',[
  '<code>flag.String("name", "мир", "подсказка")</code> объявляет флаг и возвращает <b>указатель</b> на значение, поэтому дальше пишут <code>*name</code>.',
  'Типы: <code>String</code>, <code>Int</code>, <code>Bool</code>, <code>Float64</code>, <code>Duration</code> (<code>-timeout 5s</code> сразу превращается в <code>time.Duration</code>).',
  'Булев флаг записывают без значения: <code>-loud</code>. Остальные: <code>-n 2</code> или <code>-n=2</code>.',
  'Всё, что идёт после флагов (имена файлов), попадает в <code>flag.Args()</code>. Разбор останавливается на первом аргументе без дефиса.',
  'В обычной программе используют глобальные <code>flag.String</code> и <code>flag.Parse()</code>. Отдельный <code>FlagSet</code> нужен для подкоманд и тестов.']],
 ['p','Настоящая программа с глобальными флагами и своей подсказкой. После <code>go build -o greet.exe .</code>:'],
 ['code',`go run . -name Аня -n 2 -loud a.txt b.txt
go run . -h`],
 ['out',`ПРИВЕТ, АНЯ!
ПРИВЕТ, АНЯ!
файлы: [a.txt b.txt]

Использование: greet [флаги] [файлы...]
  -loud
    	писать заглавными
  -n int
    	сколько раз повторить (default 1)
  -name string
    	кого приветствовать (default "мир")`],
 ['h','3. Ошибки разбора и коды выхода'],
 ['code',`package main

import (
	"flag"
	"fmt"
	"io"
)

func main() {
	fs := flag.NewFlagSet("demo", flag.ContinueOnError)
	fs.SetOutput(io.Discard) // не печатать справку автоматически
	n := fs.Int("n", 1, "число")

	err := fs.Parse([]string{"-n", "abc"})
	fmt.Println("ошибка:", err)

	err = fs.Parse([]string{"-unknown"})
	fmt.Println("ошибка:", err)

	err = fs.Parse([]string{"-n=7"})
	fmt.Println(*n, err)
}`],
 ['out',`ошибка: invalid value "abc" for flag -n: parse error
ошибка: flag provided but not defined: -unknown
7 <nil>`],
 ['tbl',['Код выхода','Когда'],[
  ['<code>0</code>','Успех (программа дошла до конца main)'],
  ['<code>1</code>','Общая ошибка: что-то пошло не так во время работы'],
  ['<code>2</code>','Ошибка использования: неверные флаги (так делает сам пакет flag)'],
  ['<code>3</code> и выше','Свои коды для особых случаев, их описывают в справке']]],
 ['code',`package main

import (
	"fmt"
	"os"
)

func main() {
	defer fmt.Println("этот defer НЕ выполнится")
	fmt.Println("работаю")
	os.Exit(3)
}`],
 ['out','работаю'],
 ['warn','<code>os.Exit</code> завершает программу <b>мгновенно, без выполнения отложенных вызовов</b>. Поэтому <code>os.Exit</code> вызывают только в <code>main</code>, а остальные функции возвращают ошибку наверх. То же правило и для <code>log.Fatal</code>: он тоже вызывает <code>os.Exit</code>.'],
 ['h','4. Подкоманды: add, list, remove'],
 ['code',`package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
)

// run разбирает подкоманды и возвращает ошибку, а не вызывает os.Exit
func run(args []string) error {
	if len(args) == 0 {
		return errors.New("нужна подкоманда: add или list")
	}
	switch args[0] {
	case "add":
		fs := flag.NewFlagSet("add", flag.ContinueOnError)
		title := fs.String("title", "", "название задачи")
		if err := fs.Parse(args[1:]); err != nil {
			return err
		}
		if *title == "" {
			return errors.New("add: нужен -title")
		}
		fmt.Println("добавлено:", *title)
	case "list":
		fmt.Println("список задач пуст")
	default:
		return fmt.Errorf("неизвестная подкоманда %q", args[0])
	}
	return nil
}

func main() {
	// в настоящей программе: run(os.Args[1:])
	for _, args := range [][]string{{"add", "-title", "Купить молоко"}, {"list"}, {"add"}, {"remove"}, {}} {
		if err := run(args); err != nil {
			fmt.Fprintln(os.Stdout, "ошибка:", err)
		}
	}
}`],
 ['out',`добавлено: Купить молоко
список задач пуст
ошибка: add: нужен -title
ошибка: неизвестная подкоманда "remove"
ошибка: нужна подкоманда: add или list`],
 ['case','Один main, вся логика в run',[
  '<p>Тот же приём, который показан выше, применяют во всех серьёзных утилитах: <code>func main() { if err := run(os.Args[1:]); err != nil { fmt.Fprintln(os.Stderr, err); os.Exit(1) } }</code>. Вся логика лежит в <code>run</code>, которую можно запускать в тестах с любыми аргументами, а выход из программы происходит в одном месте. Для больших CLI с вложенными командами возьми библиотеку ' + A('https://github.com/spf13/cobra','cobra') + ': она строится на тех же флагах.</p>']],
 ['h','5. Переменные окружения'],
 ['code',`package main

import (
	"fmt"
	"os"
)

func main() {
	os.Setenv("APP_PORT", "9090")
	port := os.Getenv("APP_PORT")
	missing := os.Getenv("APP_NOPE")
	v, ok := os.LookupEnv("APP_NOPE")
	fmt.Printf("%q %q %q %v\\n", port, missing, v, ok)

	if v, ok := os.LookupEnv("APP_PORT"); ok {
		fmt.Println("порт из окружения:", v)
	}
}`],
 ['out',`"9090" "" "" false
порт из окружения: 9090`],
 ['p','<code>os.Getenv</code> для отсутствующей переменной возвращает пустую строку и не отличает «нет переменной» от «пустая». Различать их помогает <code>os.LookupEnv</code>. Хорошая схема для сервисов: флаг переопределяет переменную окружения, а та переопределяет значение по умолчанию.'],
 ['h','6. Как делать хорошие утилиты'],
 ['ul',[
  'Всегда продумай <code>-h</code>: подсказка к каждому флагу и пример запуска (это <code>flag.Usage</code>).',
  'Ошибки печатай в <code>os.Stderr</code>, а результат в <code>os.Stdout</code>: так вывод можно перенаправить в файл или другую программу.',
  'Выход с кодом 0 только при успехе. Скрипты и CI проверяют код.',
  'Принципы удобного интерфейса собраны в руководстве ' + A('https://clig.dev/','Command Line Interface Guidelines') + '.']],
 ['h','7. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['<code>panic: index out of range [1] with length 1</code>','Обратилась к <code>os.Args[1]</code>, а аргументов нет. Проверь <code>len(os.Args)</code>'],
  ['Флаги после имён файлов не читаются','Разбор останавливается на первом аргументе без дефиса. Флаги ставь перед ним'],
  ['<code>cannot use name (variable of type *string) as string</code>','Флаг возвращает указатель. Пиши <code>*name</code> после <code>Parse</code>'],
  ['Значение флага «пустое» до <code>Parse</code>','Читай значения только после <code>flag.Parse()</code>'],
  ['<code>defer</code> не выполняется','Перед ним был <code>os.Exit</code> или <code>log.Fatal</code>']]],
 ['h','8. Вопросы с собеседований'],
 ['ul',[
  '<b>Чем os.Args отличается от flag?</b> <code>os.Args</code> сырой список строк, <code>flag</code> разбирает его на типизированные флаги.',
  '<b>Почему flag.String возвращает указатель?</b> Значение заполняется позже, при <code>Parse</code>, поэтому нужна ссылка на ячейку.',
  '<b>Что делает os.Exit и в чём опасность?</b> Завершает программу сразу, не запуская <code>defer</code>.',
  '<b>Какие бывают коды выхода?</b> 0 успех, 1 ошибка работы, 2 неверное использование.']],
 ['h','9. Практика'],
 ['ol',[
  'Напиши утилиту <code>wc-lite</code>: принимает имена файлов, флаг <code>-l</code> считает строки, а без него слова.',
  'Добавь флаг <code>-timeout</code> типа Duration и проверь значение <code>-timeout 1m30s</code>.',
  'Сделай подкоманды <code>add</code>, <code>list</code>, <code>done</code> для списка задач из этапа 2 и разбери их через <code>FlagSet</code>.',
  'Вынеси логику в <code>run(args []string) error</code>, оставь в <code>main</code> только вывод ошибки и <code>os.Exit</code>.',
  'Прочитай порт сначала из флага, потом из переменной окружения, потом по умолчанию 8080.']],
 ['src',[
  ['Пакет flag (документация)','https://pkg.go.dev/flag','Все типы флагов, FlagSet, Usage','en'],
  ['Пакет os: Args и Exit','https://pkg.go.dev/os#Args','os.Args, Exit, Getenv, LookupEnv','en'],
  ['Go by Example: Command-Line Arguments','https://gobyexample.com/command-line-arguments','os.Args на коротком примере','en'],
  ['Go by Example: Command-Line Flags','https://gobyexample.com/command-line-flags','Флаги и их типы','en'],
  ['Go by Example: Command-Line Subcommands','https://gobyexample.com/command-line-subcommands','Подкоманды через FlagSet','en'],
  ['Go by Example: Exit','https://gobyexample.com/exit','os.Exit и defer','en'],
  ['Go by Example: Environment Variables','https://gobyexample.com/environment-variables','Getenv и Setenv','en'],
  ['Command Line Interface Guidelines','https://clig.dev/','Как проектировать удобные утилиты командной строки','en'],
  ['Как использовать flag (DigitalOcean)','https://www.digitalocean.com/community/tutorials/how-to-use-the-flag-package-in-go','Пошаговый разбор с FlagSet','en'],
  ['cobra','https://github.com/spf13/cobra','Библиотека для больших CLI: следующий шаг','en']]]],
 q:[["Где лежат аргументы командной строки и что в os.Args[0]?","В os.Args. Нулевой элемент это путь самой программы."],["Что возвращает flag.Int и как читать значение?","Указатель *int. Значение читают как *n после flag.Parse()."],["Чем булев флаг отличается от остальных в записи?","Его пишут без значения: -loud. Для остальных нужно -n 2 или -n=2."],["Что делает os.Exit и почему им не пользуются где попало?","Мгновенно завершает программу без defer. Его вызывают только в main."],["Какие коды выхода принято использовать?","0 успех, 1 общая ошибка, 2 неверные аргументы."],["В чём разница Getenv и LookupEnv?","LookupEnv ещё возвращает ok: можно отличить отсутствие переменной от пустого значения."]],
 l:[["doc","Пакет flag (документация)","https://pkg.go.dev/flag","en"],["trainer","Go by Example: Command-Line Flags","https://gobyexample.com/command-line-flags","en"],["trainer","Go by Example: Command-Line Subcommands","https://gobyexample.com/command-line-subcommands","en"],["doc","Command Line Interface Guidelines","https://clig.dev/","en"],["art","Как использовать flag (DigitalOcean)","https://www.digitalocean.com/community/tutorials/how-to-use-the-flag-package-in-go","en"]]},

"s2-4":{b:[
 ['p',`До Go 1.21 на каждую мелочь со срезом («есть ли элемент», «отсортировать по полю», «вставить в середину») приходилось писать цикл или тащить стороннюю библиотеку. Теперь для этого есть стандартные пакеты ${A('https://pkg.go.dev/slices','slices')} и ${A('https://pkg.go.dev/maps','maps')}, работающие с любыми типами элементов. Они короче ручных циклов, проверены и обычно быстрее.`],
 ['real',5,'каждый день',[
  '<b>Сортировка</b> списков по полю: заказы по дате, пользователи по имени, товары по цене.',
  '<b>Поиск и проверка:</b> «есть ли такой ID в списке», «найти первый подходящий».',
  '<b>Чистка данных:</b> убрать повторы в списке идентификаторов из запроса, вставить или удалить элемент.',
  '<b>Работа с map:</b> получить ключи в отсортированном порядке, скопировать map, удалить по условию.',
  '<b>Ревью:</b> ручной цикл поиска там, где есть <code>slices.Contains</code>, считается шумом.']],
 ['h','1. Пакет slices: основа'],
 ['code',`package main

import (
	"cmp"
	"fmt"
	"slices"
	"strings"
)

type User struct {
	Name string
	Age  int
}

func main() {
	xs := []int{5, 2, 8, 1, 9, 2}
	slices.Sort(xs)
	fmt.Println(xs, slices.Contains(xs, 8), slices.Index(xs, 8), slices.Max(xs), slices.Min(xs))

	i, found := slices.BinarySearch(xs, 8)
	fmt.Println(i, found)
	i, found = slices.BinarySearch(xs, 3)
	fmt.Println(i, found)

	users := []User{{"Боря", 31}, {"Аня", 25}, {"Вика", 25}}
	slices.SortFunc(users, func(a, b User) int {
		if n := cmp.Compare(a.Age, b.Age); n != 0 {
			return n
		}
		return strings.Compare(a.Name, b.Name)
	})
	fmt.Println(users)

	idx := slices.IndexFunc(users, func(u User) bool { return u.Age > 30 })
	fmt.Println(idx, slices.ContainsFunc(users, func(u User) bool { return u.Name == "Вика" }))
}`],
 ['out',`[1 2 2 5 8 9] true 4 9 1
4 true
3 false
[{Аня 25} {Вика 25} {Боря 31}]
2 true`],
 ['tbl',['Функция','Что делает'],[
  ['<code>slices.Sort(s)</code>','Сортирует по возрастанию (для чисел, строк и других упорядоченных типов)'],
  ['<code>slices.SortFunc(s, cmp)</code>','Сортирует по своей функции сравнения: возвращает отрицательное, 0 или положительное число'],
  ['<code>slices.SortStableFunc</code>','Сохраняет порядок равных элементов'],
  ['<code>slices.Contains</code>, <code>ContainsFunc</code>','Есть ли элемент или подходящий под условие'],
  ['<code>slices.Index</code>, <code>IndexFunc</code>','Позиция или -1'],
  ['<code>slices.BinarySearch</code>','Быстрый поиск в уже отсортированном срезе: позиция и «нашёл ли»'],
  ['<code>slices.Max</code>, <code>slices.Min</code>','Наибольший и наименьший (паникуют на пустом срезе)']]],
 ['p','Функция сравнения для <code>SortFunc</code> возвращает число, а не bool: <code>cmp.Compare(a, b)</code> даёт -1, 0 или 1. Для составной сортировки (сначала возраст, потом имя) проверяют второе поле, когда первое равно.'],
 ['h','2. Вставка, удаление, повторы'],
 ['code',`package main

import (
	"fmt"
	"slices"
)

func main() {
	xs := []int{1, 2, 2, 3, 3, 3, 4}
	fmt.Println(slices.Compact(slices.Clone(xs)))

	ys := []int{10, 20, 30, 40}
	ys = slices.Insert(ys, 1, 15, 17)
	fmt.Println(ys)
	ys = slices.Delete(ys, 0, 2)
	fmt.Println(ys)

	slices.Reverse(ys)
	fmt.Println(ys, slices.Equal(ys, []int{40, 30, 20, 17}))

	all := slices.Concat([]int{1, 2}, []int{3}, []int{4, 5})
	fmt.Println(all, len(all))

	zs := []int{1, 2, 3, 4, 5}
	del := slices.Delete(zs, 1, 3)
	fmt.Println(del, zs) // хвост исходного среза обнуляется
}`],
 ['out',`[1 2 3 4]
[10 15 17 20 30 40]
[17 20 30 40]
[40 30 20 17] true
[1 2 3 4 5] 5
[1 4 5] [1 4 5 0 0]`],
 ['ul',[
  '<code>Insert(s, i, v...)</code> и <code>Delete(s, i, j)</code> <b>возвращают новый срез</b>: результат обязательно присваивай обратно (<code>s = slices.Delete(...)</code>).',
  '<code>Delete</code> сдвигает хвост и <b>обнуляет освободившиеся ячейки</b> исходного массива (с Go 1.22). Если держишь старый срез, ты увидишь нули в конце: последняя строка вывода показывает это.',
  '<code>Compact</code> убирает <b>подряд идущие</b> повторы, поэтому перед ним срез сортируют. Он тоже меняет исходный массив, поэтому в примере сначала <code>Clone</code>.',
  '<code>Clone</code> делает независимую копию, <code>Equal</code> сравнивает срезы по элементам (оператор <code>==</code> для срезов запрещён).']],
 ['case','Идентификаторы из запроса: без повторов и по порядку',[
  '<p>API получает <code>?ids=7,3,7,1,3,9</code>. Перед запросом в базу идентификаторы нужно очистить: убрать повторы и отсортировать. В три строки на slices:</p>']],
 ['code',`package main

import (
	"fmt"
	"slices"
)

// uniqueIDs убирает повторы и сортирует идентификаторы из запроса.
func uniqueIDs(ids []int) []int {
	out := slices.Clone(ids)
	slices.Sort(out)
	return slices.Compact(out)
}

func main() {
	fmt.Println(uniqueIDs([]int{7, 3, 7, 1, 3, 9}))
	fmt.Println(uniqueIDs(nil) == nil, len(uniqueIDs(nil)))
}`],
 ['out',`[1 3 7 9]
true 0`],
 ['h','3. Пакет maps'],
 ['code',`package main

import (
	"fmt"
	"maps"
	"slices"
)

func main() {
	stock := map[string]int{"яблоки": 5, "груши": 2, "киви": 9}

	keys := slices.Sorted(maps.Keys(stock))
	fmt.Println(keys)

	vals := slices.Sorted(maps.Values(stock))
	fmt.Println(vals)

	copyM := maps.Clone(stock)
	copyM["киви"] = 0
	fmt.Println(stock["киви"], copyM["киви"], maps.Equal(stock, copyM))

	extra := map[string]int{"сливы": 4, "груши": 7}
	maps.Copy(stock, extra)
	fmt.Println(len(stock), stock["груши"])

	maps.DeleteFunc(stock, func(k string, v int) bool { return v < 5 })
	fmt.Println(slices.Sorted(maps.Keys(stock)))

	fmt.Println(min(3, 1, 2), max(2.5, 1))
	clear(stock)
	fmt.Println(len(stock))
}`],
 ['out',`[груши киви яблоки]
[2 5 9]
9 0 false
4 7
[груши киви яблоки]
1 2.5
0`],
 ['tbl',['Функция','Что делает'],[
  ['<code>maps.Keys(m)</code>, <code>maps.Values(m)</code>','Ключи и значения как последовательность (с Go 1.23); собрать в срез: <code>slices.Collect</code>, в отсортированный: <code>slices.Sorted</code>'],
  ['<code>maps.Clone(m)</code>','Независимая копия map'],
  ['<code>maps.Copy(dst, src)</code>','Добавить все пары из src в dst (одинаковые ключи перезаписываются)'],
  ['<code>maps.Equal(a, b)</code>','Равны ли карты по содержимому'],
  ['<code>maps.DeleteFunc(m, f)</code>','Удалить все пары, для которых f вернула true'],
  ['<code>min</code>, <code>max</code>, <code>clear</code> (встроенные)','Наименьшее и наибольшее из значений; очистка map или среза']]],
 ['warn','<b>Версия Go.</b> До Go 1.23 функции <code>maps.Keys</code> и <code>maps.Values</code> возвращали срезы, а не последовательности. В старом коде и старых статьях ты увидишь <code>keys := maps.Keys(m)</code> как срез. Сейчас так: <code>keys := slices.Sorted(maps.Keys(m))</code>. Если в проекте версия Go ниже, проверь <code>go.mod</code>.'],
 ['h','4. Чего в slices нет'],
 ['p','Пакеты не содержат <code>Map</code>, <code>Filter</code> и <code>Reduce</code>: Go намеренно оставляет их обычным циклам, чтобы код читался одинаково везде. Фильтрацию и преобразование пишут циклом, а сортированные операции делают через <code>slices</code>. Готовые «рецепты» (вырезать, вставить, развернуть, перетасовать) собраны в ' + A('https://go.dev/wiki/SliceTricks','Go Wiki: SliceTricks') + '.'],
 ['code',`package main

import "fmt"

func main() {
	nums := []int{1, 2, 3, 4, 5, 6}
	var evens []int
	for _, n := range nums {
		if n%2 == 0 {
			evens = append(evens, n)
		}
	}
	fmt.Println(evens)
}`],
 ['out','[2 4 6]'],
 ['h','5. Что изменилось по сравнению с sort'],
 ['tbl',['Задача','Старый способ','Теперь'],[
  ['Сортировка чисел','<code>sort.Ints(xs)</code>','<code>slices.Sort(xs)</code>'],
  ['Сортировка по полю','<code>sort.Slice(xs, func(i, j int) bool ...)</code>','<code>slices.SortFunc(xs, func(a, b T) int ...)</code>'],
  ['Есть ли элемент','Цикл','<code>slices.Contains</code>'],
  ['Копия среза','<code>append([]int(nil), xs...)</code>','<code>slices.Clone(xs)</code>'],
  ['Ключи map по порядку','Цикл + <code>sort.Strings</code>','<code>slices.Sorted(maps.Keys(m))</code>']]],
 ['h','6. Частые ошибки'],
 ['code',`package main

import (
	"fmt"
	"slices"
)

func main() {
	xs := []int{3, 1, 2}
	fmt.Println(slices.Index(xs, "1"))
}`],
 ['out','./main.go:10:31: cannot use "1" (untyped string constant) as int value in argument to slices.Index'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['Срез не изменился после <code>Insert</code> или <code>Delete</code>','Забыла присвоить результат: <code>s = slices.Delete(s, i, j)</code>'],
  ['<code>Compact</code> не убрал повторы','Срез не отсортирован. Сначала <code>slices.Sort</code>'],
  ['Паника в <code>slices.Max</code>','Срез пустой. Проверь <code>len(s) &gt; 0</code>'],
  ['После <code>Delete</code> в старом срезе нули','С Go 1.22 хвост обнуляется. Работай с возвращённым срезом'],
  ['Порядок ключей map «прыгает»','Обход map случаен. Собери ключи через <code>slices.Sorted(maps.Keys(m))</code>']]],
 ['h','7. Вопросы с собеседований'],
 ['ul',[
  '<b>Как отсортировать срез структур по полю?</b> <code>slices.SortFunc</code> с функцией сравнения, возвращающей отрицательное, ноль или положительное число.',
  '<b>Как получить отсортированные ключи map?</b> <code>slices.Sorted(maps.Keys(m))</code>.',
  '<b>Чем Delete из slices отличается от ручного append(s[:i], s[i+1:]...)?</b> Делает то же, но ещё обнуляет освободившийся хвост, чтобы не удерживать память.',
  '<b>Почему нельзя сравнить срезы через ==?</b> Это запрещено, для этого есть <code>slices.Equal</code>.']],
 ['h','8. Практика'],
 ['ol',[
  'Дан срез заказов (ID, сумма, дата). Отсортируй по сумме по убыванию, а при равных суммах по дате.',
  'Реализуй дедупликацию списка слов (без учёта регистра) через <code>slices.SortFunc</code> и <code>slices.CompactFunc</code>.',
  'Возьми map «слово → число повторений» и выведи топ-3 слова: ключи в срез, сортировка по значению.',
  'Скопируй map и убедись, что правка копии не меняет оригинал. Затем сделай то же через присваивание и объясни разницу.',
  'Перепиши два своих ручных цикла (поиск и вставка) на <code>slices</code>.']],
 ['src',[
  ['Пакет slices','https://pkg.go.dev/slices','Все функции с примерами','en'],
  ['Пакет maps','https://pkg.go.dev/maps','Keys, Values, Clone, Copy, DeleteFunc','en'],
  ['Пакет cmp','https://pkg.go.dev/cmp','Compare, Less, Or для функций сравнения','en'],
  ['Go 1.21 Release (блог Go)','https://go.dev/blog/go1.21','Что принёс релиз: slices, maps, min, max, clear','en'],
  ['Robust generic functions on slices (блог Go)','https://go.dev/blog/generic-slice-functions','Как устроены функции и какие ловушки в них исправили','en'],
  ['Go Wiki: SliceTricks','https://go.dev/wiki/SliceTricks','Готовые рецепты для срезов','en'],
  ['Go Slices: usage and internals','https://go.dev/blog/slices-intro','Как устроен срез изнутри','en'],
  ['Go by Example: Slices и Maps','https://gobyexample.com/slices','Базовые операции','en']]]],
 q:[["Как отсортировать срез структур по возрасту, а при равенстве по имени?","slices.SortFunc и функция, которая сначала сравнивает возраст через cmp.Compare, а при 0 сравнивает имя."],["Что вернёт slices.BinarySearch и когда он работает?","Позицию и bool «нашёл ли». Срез должен быть отсортирован."],["Почему перед slices.Compact срез сортируют?","Compact убирает только подряд идущие повторы."],["Что нужно сделать с результатом slices.Delete?","Присвоить обратно: s = slices.Delete(s, i, j). Старый срез остаётся с обнулённым хвостом."],["Как получить ключи map в порядке возрастания?","slices.Sorted(maps.Keys(m))."],["Почему в slices нет Map и Filter?","Авторы языка оставляют такие операции обычным циклам: код читается одинаково везде."]],
 l:[["doc","Пакет slices","https://pkg.go.dev/slices","en"],["doc","Пакет maps","https://pkg.go.dev/maps","en"],["art","Robust generic functions on slices (блог Go)","https://go.dev/blog/generic-slice-functions","en"],["doc","Go Wiki: SliceTricks","https://go.dev/wiki/SliceTricks","en"]]},

"s2-5":{b:[
 ['p',`Строки в Go неизменяемы: каждое «изменение» создаёт новую строку и копирует старую. Для одной-двух склеек это не страшно, но в цикле превращается в тормоза. Поэтому для сборки текста есть ${A('https://pkg.go.dev/strings#Builder','strings.Builder')}, а для работы с «сырыми» данными пакет ${A('https://pkg.go.dev/bytes','bytes')} с типом <code>bytes.Buffer</code>.`],
 ['real',5,'каждый день',[
  '<b>Сборка ответов и отчётов:</b> тексты писем, CSV, SQL-запросы, логи.',
  '<b>Ввод-вывод:</b> <code>bytes.Buffer</code> как «файл в памяти» для тестов и промежуточных данных.',
  '<b>Конвертации</b> между <code>string</code> и <code>[]byte</code>: ответ сервера, тело запроса, хеши.',
  '<b>Скорость:</b> склейка в цикле через <code>+=</code> один из самых частых поводов для замечания на ревью.']],
 ['h','1. Почему += в цикле плохо'],
 ['p','Каждый <code>s += "..."</code> выделяет память под новую строку и копирует в неё всё накопленное. Для тысячи склеек это ~тысяча выделений и миллионы скопированных байтов: время растёт как квадрат от числа склеек. Вот замер на этом компьютере: 1000 склеек строки «строка »:'],
 ['tbl',['Способ','Время на операцию','Память','Выделений'],[
  ['<code>s += "строка "</code>','≈ 943 мкс','≈ 6,9 МБ','999'],
  ['<code>strings.Builder</code>','≈ 13 мкс','≈ 63 КБ','16'],
  ['<code>Builder</code> с <code>Grow</code>','≈ 7 мкс','≈ 13 КБ','1'],
  ['<code>bytes.Buffer</code>','≈ 35 мкс','≈ 46 КБ','10']]],
 ['p','Builder быстрее склейки примерно в 70 раз, а с <code>Grow</code> (если примерный размер известен) примерно в 130 раз. Точные цифры зависят от компьютера и версии Go, но порядок всегда такой. Замер делается через <code>go test -bench</code>, подробнее в этапе про тесты. Тот же вывод у независимых замеров: ' + A('https://brandur.org/fragments/bytes-buffer-vs-strings-builder','Brandur') + ', ' + A('https://100go.co/#under-optimized-strings-concatenation-39','100 Go Mistakes №39') + '.'],
 ['h','2. strings.Builder'],
 ['code',`package main

import (
	"fmt"
	"strings"
)

func main() {
	var sb strings.Builder
	sb.Grow(64)
	sb.WriteString("Отчёт")
	sb.WriteByte(':')
	sb.WriteRune(' ')
	sb.WriteRune('✓')
	fmt.Fprintf(&sb, " %d шт", 3)
	fmt.Println(sb.String(), sb.Len())
	sb.Reset()
	fmt.Println(sb.Len(), sb.String() == "")
}`],
 ['out',`Отчёт: ✓ 3 шт 22
0 true`],
 ['ul',[
  '<code>WriteString</code>, <code>WriteByte</code>, <code>WriteRune</code> добавляют текст, <code>String()</code> отдаёт результат <b>без копирования</b>.',
  '<code>Grow(n)</code> заранее резервирует место. Если размер примерно известен, это убирает лишние выделения.',
  '<code>fmt.Fprintf(&sb, ...)</code> форматирует прямо в Builder, потому что он реализует <code>io.Writer</code>.',
  '<code>Len()</code> считает <b>байты</b>, не символы: строка «Отчёт: ✓ 3 шт» занимает 22 байта.',
  '<b>Builder нельзя копировать</b> после первой записи: при копии и повторной записи будет паника <code>illegal use of non-zero Builder copied by value</code>. Передавай указатель.']],
 ['case','Текстовая таблица для отчёта',[
  '<p>Отчёты, письма и вывод в консоль собирают одним проходом по данным. Формат <code>%-10s</code> выравнивает текст по левому краю в ширину 10, <code>%5d</code> число по правому.</p>']],
 ['code',`package main

import (
	"fmt"
	"strings"
)

type Item struct {
	Name  string
	Qty   int
	Price int // копейки
}

func report(items []Item) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "%-10s %3s %8s\\n", "Товар", "шт", "сумма")
	sb.WriteString(strings.Repeat("-", 23) + "\\n")
	total := 0
	for _, it := range items {
		sum := it.Qty * it.Price
		total += sum
		fmt.Fprintf(&sb, "%-10s %3d %5d.%02d\\n", it.Name, it.Qty, sum/100, sum%100)
	}
	fmt.Fprintf(&sb, "%-14s %5d.%02d", "Итого", total/100, total%100)
	return sb.String()
}

func main() {
	fmt.Println(report([]Item{{"Чашка", 2, 49900}, {"Ложка", 6, 7550}, {"Блюдце", 1, 12000}}))
}`],
 ['out',`Товар       шт    сумма
-----------------------
Чашка        2   998.00
Ложка        6   453.00
Блюдце       1   120.00
Итого           1571.00`],
 ['h','3. bytes.Buffer и пакет bytes'],
 ['code',`package main

import (
	"bytes"
	"fmt"
	"io"
	"strings"
)

func main() {
	var buf bytes.Buffer
	buf.WriteString("первая строка\\n")
	buf.Write([]byte("вторая строка\\n"))
	fmt.Fprintf(&buf, "третья %d\\n", 3)
	fmt.Println(buf.Len())

	line, _ := buf.ReadString('\\n') // Buffer умеет и читать
	fmt.Printf("%q\\n", line)
	rest, _ := io.ReadAll(&buf)
	fmt.Printf("%q\\n", string(rest))

	data := []byte("  Go, Rust, Zig  ")
	fmt.Printf("%q\\n", bytes.TrimSpace(data))
	fmt.Println(bytes.Contains(data, []byte("Rust")), bytes.Equal([]byte("a"), []byte("a")))
	fmt.Printf("%q\\n", bytes.Split(bytes.TrimSpace(data), []byte(", ")))
	fmt.Println(string(bytes.ToUpper([]byte("привет"))))

	r := strings.NewReader("читаем строку как поток")
	b := make([]byte, 6)
	n, _ := r.Read(b)
	fmt.Println(n, string(b[:n]))
}`],
 ['out',`67
"первая строка\\n"
"вторая строка\\nтретья 3\\n"
"Go, Rust, Zig"
true true
["Go" "Rust" "Zig"]
ПРИВЕТ
6 чит`],
 ['tbl',['Вопрос','strings.Builder','bytes.Buffer'],[
  ['Что умеет','Только собирать строку (писать)','Писать и читать, как файл в памяти'],
  ['Реализует','<code>io.Writer</code>','<code>io.Reader</code> и <code>io.Writer</code>'],
  ['Результат','<code>String()</code> без копирования','<code>String()</code> копирует, <code>Bytes()</code> отдаёт срез'],
  ['Когда брать','Собираешь текст и отдаёшь строкой','Нужно читать записанное, работаешь с байтами, пишешь тесты']]],
 ['p','Функции пакета <code>bytes</code> повторяют <code>strings</code>, но работают со срезами байтов: <code>Contains</code>, <code>Split</code>, <code>Trim*</code>, <code>ToUpper</code>, <code>Equal</code>. Сравнивать срезы байтов через <code>==</code> нельзя, для этого <code>bytes.Equal</code>. Байтовая версия экономит копирование, если данные уже лежат в <code>[]byte</code> (тело HTTP-ответа, содержимое файла).'],
 ['h','4. string и []byte: копия при преобразовании'],
 ['code',`package main

import "fmt"

func main() {
	s := "go"
	b := []byte(s) // копия данных
	b[0] = 'G'
	fmt.Println(s, string(b)) // строка не изменилась: байты скопированы
	fmt.Println(len(s), len(b))

	r := []rune("привет")
	r[0] = 'П'
	fmt.Println(string(r), len(r))
}`],
 ['out',`go Go
2 2
Привет 6`],
 ['p','Преобразование <code>[]byte(s)</code> и <code>string(b)</code> каждый раз <b>копирует</b> данные. Поэтому в «горячем» коде лишние преобразования туда-обратно убирают (это отдельная ошибка в ' + A('https://100go.co/','100 Go Mistakes') + ' №40). Для правки отдельных символов текста берут <code>[]rune</code>, для работы с байтами <code>[]byte</code>.'],
 ['code',`package main

func main() {
	s := "привет"
	b := []byte(s)
	b[0] = 'П'
}`],
 ['out','./main.go:6:9: cannot use \'П\' (untyped rune constant 1055) as byte value in assignment (overflows)'],
 ['p','Буква «П» не помещается в один байт (её код 1055), поэтому для кириллицы одного байта мало: используй <code>[]rune</code>. Это та же тема, что в строках, байтах и рунах.'],
 ['h','5. Мелочи, которые пригодятся'],
 ['code',`package main

import (
	"fmt"
	"strings"
)

func main() {
	rep := strings.NewReplacer("<", "&lt;", ">", "&gt;", "&", "&amp;")
	fmt.Println(rep.Replace("a < b && c > d"))

	words := []string{"Go", "учим", "по", "вечерам"}
	fmt.Println(strings.Join(words, " "))

	var sb strings.Builder
	for i, w := range words {
		if i > 0 {
			sb.WriteByte(' ')
		}
		sb.WriteString(strings.ToUpper(w))
	}
	fmt.Println(sb.String())
}`],
 ['out',`a &lt; b &amp;&amp; c &gt; d
Go учим по вечерам
GO УЧИМ ПО ВЕЧЕРАМ`],
 ['ul',[
  '<code>strings.Join(parts, sep)</code> для готового среза строк уже эффективен внутри и короче цикла с Builder.',
  '<code>strings.NewReplacer</code> заменяет несколько пар за один проход.',
  'Одна-две склейки (<code>"Привет, " + name</code>) оставь обычным <code>+</code> или <code>fmt.Sprintf</code>: Builder нужен для циклов и больших текстов.']],
 ['h','6. Частые ошибки'],
 ['tbl',['Что случилось','Почему и что делать'],[
  ['Медленная сборка текста в цикле','Склейка через <code>+=</code>. Замени на <code>strings.Builder</code> и по возможности <code>Grow</code>'],
  ['<code>panic: strings: illegal use of non-zero Builder copied by value</code>','Builder скопирован после записи. Передавай <code>*strings.Builder</code>'],
  ['Сравнение срезов байтов через <code>==</code> не компилируется','Используй <code>bytes.Equal</code>'],
  ['Лишние <code>string(b)</code> и <code>[]byte(s)</code> в цикле','Каждое преобразование копирует данные. Работай в одном типе'],
  ['Длина строки больше ожидаемой','<code>Len()</code> и <code>len(s)</code> считают байты, не символы']]],
 ['h','7. Вопросы с собеседований'],
 ['ul',[
  '<b>Почему конкатенация в цикле медленная?</b> Строки неизменяемы: каждая склейка создаёт новую и копирует старую, получается квадратичное время.',
  '<b>Чем strings.Builder лучше +?</b> Копит данные в одном буфере и отдаёт строку без лишнего копирования.',
  '<b>В чём разница Builder и bytes.Buffer?</b> Builder только пишет и быстрее для итоговой строки, Buffer ещё и читает.',
  '<b>Что делает Grow?</b> Резервирует место заранее, чтобы не перевыделять память.']],
 ['h','8. Практика'],
 ['ol',[
  'Реализуй функцию, которая принимает срез строк и возвращает их через запятую «a, b и c» (последний разделитель «и»), через <code>strings.Builder</code>.',
  'Сделай бенчмарк склейки 10 000 строк тремя способами (+=, Builder, Builder с Grow) и сравни время.',
  'Собери CSV-отчёт из среза структур, экранируя запятые и кавычки.',
  'Напиши функцию, которая читает данные из <code>bytes.Buffer</code> построчно (<code>ReadString</code>) и считает слова.',
  'Замени в своём мини-проекте все склейки в циклах на Builder.']],
 ['src',[
  ['strings.Builder (документация)','https://pkg.go.dev/strings#Builder','Методы Builder и ограничения','en'],
  ['bytes.Buffer (документация)','https://pkg.go.dev/bytes#Buffer','Методы Buffer','en'],
  ['Пакет bytes','https://pkg.go.dev/bytes','Функции для срезов байтов','en'],
  ['Strings, bytes, runes and characters in Go (блог Go)','https://go.dev/blog/strings','Как устроены строки и байты','en'],
  ['bytes.Buffer vs strings.Builder (Brandur)','https://brandur.org/fragments/bytes-buffer-vs-strings-builder','Короткий замер и вывод','en'],
  ['100 Go Mistakes: неоптимальная конкатенация','https://100go.co/#under-optimized-strings-concatenation-39','Объяснение и бенчмарк','en'],
  ['Go by Example: String Formatting','https://gobyexample.com/string-formatting','Все форматы Printf и Fprintf','en']]]],
 q:[["Почему s += x в цикле плохо?","Каждая склейка копирует всё накопленное: время и память растут квадратично."],["Чем strings.Builder отличается от bytes.Buffer?","Builder только собирает строку и отдаёт её без копирования, Buffer ещё и читает как io.Reader."],["Что делает Builder.Grow?","Заранее резервирует память, чтобы не перевыделять её при росте."],["Почему нельзя копировать Builder после записи?","Он хранит внутри указатель на себя и при копировании паникует. Передавай указатель."],["Копирует ли []byte(s) данные?","Да, каждое преобразование между string и []byte копирует данные."],["Как сравнить два []byte?","bytes.Equal. Оператор == для срезов не работает."]],
 l:[["doc","strings.Builder (документация)","https://pkg.go.dev/strings#Builder","en"],["doc","bytes.Buffer (документация)","https://pkg.go.dev/bytes#Buffer","en"],["art","bytes.Buffer vs strings.Builder (Brandur)","https://brandur.org/fragments/bytes-buffer-vs-strings-builder","en"],["art","100 Go Mistakes: неоптимальная конкатенация","https://100go.co/#under-optimized-strings-concatenation-39","en"]]}
});
fixTicks();
