import calendar
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, date, timedelta

app = Flask(__name__)

# конфігурація БД
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///waterapp.db'
app.config['SECRET_KEY'] = 'your_secret_key'

# створюємо об'єкт БД
db = SQLAlchemy(app)
migrate = Migrate(app, db)


# Модель User
class User(db.Model):
    __tablename__ = 'users'
    users_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.Text, default=datetime.utcnow)
    sex = db.Column(db.Text)
    weight = db.Column(db.Text)

    # зв'язок з WaterLog
    water_logs = db.relationship('WaterLog', backref='user', lazy=True)
    # зв'язок з UserSettings
    user_settings = db.relationship(
        'UserSettings', backref='user', uselist=False)

    def __repr__(self):
        return f"<User {self.users_id} {self.username} {self.email}>"


# Модель WaterLog
class WaterLog(db.Model):
    __tablename__ = 'water_logs'
    water_logs_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.users_id'), nullable=False)
    amount_ml = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


# Модель UserSettings
class UserSettings(db.Model):
    __tablename__ = 'user_settings'
    user_settings_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.users_id'), nullable=False)
    daily_goal_ml = db.Column(db.Float)


@app.route("/logout")
def logout():
    session.clear()
    flash("Ви вийшли з облікового запису", "info")
    return redirect(url_for("login"))


@app.route("/", methods=["GET", "POST"])
def index():
    today = date.today()
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for("login"))

    if request.method == "POST":
        water_count = request.form.get("waterCount", "").strip()

        if not water_count.isdigit():
            flash("Введіть коректне число", "danger")
            return redirect(url_for("index"))

        amount = int(water_count)

        if amount < 1 or amount > 5000:
            flash("Кількість води має бути від 1 до 5000 мл", "danger")
            return redirect(url_for("index"))

        new_log = WaterLog(
            user_id=user_id,
            amount_ml=amount
        )
        db.session.add(new_log)
        db.session.commit()

        flash(f"Додано {amount} мл води", "success")
        return redirect(url_for("index"))

    water_today = WaterLog.query.filter_by(user_id=user_id).all()

    total_drunk = 0
    for log in water_today:
        if log.timestamp.date() == today:
            total_drunk += float(log.amount_ml)

    settings = UserSettings.query.filter_by(user_id=user_id).first()
    goal = float(
        settings.daily_goal_ml) if settings and settings.daily_goal_ml else 2000

    percent_already = round((total_drunk / goal) * 100) if goal else 0
    percent_already = min(percent_already, 100)
    percent_left = 100 - percent_already

    left = max(int(goal - total_drunk), 0)
    already = int(total_drunk)

    return render_template("index.html",
                           percent_left=percent_left,
                           percent_already=percent_already,
                           left=left,
                           already=already
                           )


def get_last_5_water_logs(user_id):
    logs = (
        WaterLog.query
        .filter_by(user_id=user_id)
        .order_by(WaterLog.timestamp.desc())
        .limit(5)
        .all()
    )

    result = []
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    for log in logs:
        log_date = log.timestamp.date()
        log_time = log.timestamp.strftime("%H:%M")

        if log_date == today:
            day_str = "Сьогодні"
        elif log_date == yesterday:
            day_str = "Вчора"
        else:
            day_str = log.timestamp.strftime("%d.%m.%Y")

        result.append({
            "id": log.water_logs_id,
            "amount_ml": log.amount_ml,
            "day": day_str,
            "time": log_time
        })

    return result


@app.route("/chart", methods=["GET", "POST"])
def chart():
    if request.method == "POST":
        data = request.get_json()
        log_id = data.get('id')

        if log_id is None:
            return jsonify({"error": "ID is required"}), 400

        log = WaterLog.query.get(log_id)
        if log:
            db.session.delete(log)
            db.session.commit()
            return jsonify({"success": True}), 200
        else:
            # Якщо лог не знайдено, можна або повернути JSON, або редирект з flash
            flash("Запис не знайдено", "danger")
            return jsonify({"error": "Not found"}), 404
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for("login"))

    user = User.query.get(user_id)

    today = datetime.utcnow().date()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=7)
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    print(f"Days in month: {today}")
    print(f"Start of week: {start_of_week}, End of week: {end_of_week}")

    start_of_month = datetime.combine(
        today.replace(day=1), datetime.min.time())
    if today.month == 12:
        start_of_next_month = datetime.combine(
            today.replace(year=today.year + 1, month=1, day=1),
            datetime.min.time()
        )
    else:
        start_of_next_month = datetime.combine(
            today.replace(month=today.month + 1, day=1),
            datetime.min.time()
        )

    goal = user.user_settings.daily_goal_ml if user.user_settings else 2000

    week_logs = WaterLog.query.filter(
        WaterLog.user_id == user_id,
        WaterLog.timestamp >= start_of_week,
        WaterLog.timestamp <= end_of_week
    ).all()

    month_logs = WaterLog.query.filter(
        WaterLog.user_id == user_id,
        WaterLog.timestamp >= start_of_month,
        WaterLog.timestamp <= start_of_next_month
    ).all()

    week_stats = {i: 0 for i in range(7)}
    print(f"Week logs: {type(week_stats)}")
    month_stats = {i: 0 for i in range(1, days_in_month + 1)}

    for log in week_logs:
        day_index = log.timestamp.weekday()
        week_stats[day_index] += float(log.amount_ml or 0)

    for log in month_logs:
        day_index = log.timestamp.day
        month_stats[day_index] += float(log.amount_ml or 0)

    week_chart_labels = ['Понеділок', 'Вівторок', 'Середа',
                         'Четвер', 'Пʼятниця', 'Субота', 'Неділя']
    week_chart_values = [week_stats[i] for i in range(7)]

    month_chart_values = [month_stats[i] for i in range(1, days_in_month + 1)]
    month_chart_labels = [
        f"{i} {calendar.month_name[today.month]}" for i in range(1, days_in_month + 1)]

    last_water_logs = get_last_5_water_logs(user_id)

    return render_template("chart.html", week_chart_labels=week_chart_labels, week_chart_values=week_chart_values, goal=goal, month_chart_labels=month_chart_labels, month_chart_values=month_chart_values, last_water_logs=last_water_logs)


@app.route("/settings", methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        print("POST request received")
        user_id = session.get('user_id')
        if not user_id:
            flash("Ви не увійшли в систему", "danger")
            return redirect(url_for("login"))
        daily_goal = request.form.get("waterCount", "").strip()
        if not daily_goal.isdigit() or int(daily_goal) <= 0:
            flash("Введіть коректну ціль", "danger")
            return redirect(url_for("settings"))
        daily_goal = int(daily_goal)
        user_settings = UserSettings.query.filter_by(user_id=user_id).first()
        if not user_settings:
            user_settings = UserSettings(
                user_id=user_id, daily_goal_ml=daily_goal)
            db.session.add(user_settings)
        else:
            user_settings.daily_goal_ml = daily_goal
        db.session.commit()
        flash("Налаштування збережено", "success")
        return redirect(url_for("index"))
    return render_template("settings.html")


@app.route("/change_password", methods=["GET", "POST"])
def chenge_password():
    if request.method == "POST":
        old_password = request.form.get("old_password")
        new_password = request.form.get("new_password")
        new_password2 = request.form.get("new_password2")

        user_id = session.get('user_id')
        if not user_id:
            flash("Ви не увійшли в систему", "danger")
            return redirect(url_for("login"))

        user = User.query.get(user_id)

        if not user or not check_password_hash(user.password_hash, old_password):
            flash("Невірний старий пароль", "danger")
            return redirect(url_for("chenge_password"))

        if new_password != new_password2 or len(new_password) < 5:
            flash("Паролі не співпадають або занадто короткі", "danger")
            return redirect(url_for("chenge_password"))

        user.password_hash = generate_password_hash(new_password)
        db.session.commit()

        flash("Пароль успішно змінено", "success")
        return redirect(url_for("index"))

    return render_template("change_password.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.users_id
            session['username'] = user.username
            flash("Успішний вхід!", "success")
            return redirect(url_for('index'))
        else:
            flash("Невірна пошта або пароль", "danger")

    return render_template("login.html", title="Login")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form.get("email").strip()
        password = request.form.get("password").strip()
        password2 = request.form.get("password-2").strip()
        username = request.form.get("username").strip()
        sex = request.form.get("sex")
        weight = request.form.get("weight").strip()

        if not email or '@' not in email:
            flash("Некоректна пошта", "danger")
            return redirect(url_for('register'))

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash("Користувач з такою поштою вже існує", "danger")
            return redirect(url_for('register'))

        if not password or len(password) <= 4:
            flash("Пароль має містити більше 4 символів", "danger")
            return redirect(url_for('register'))

        if password != password2:
            flash("Паролі не співпадають", "danger")
            return redirect(url_for('register'))

        if not username:
            flash("Введіть ім'я", "danger")
            return redirect(url_for('register'))

        if sex not in ["Чоловік", "Жінка"]:
            flash("Оберіть стать", "danger")
            return redirect(url_for('register'))

        if not weight.isdigit():
            flash("Вага має бути числом", "danger")
            return redirect(url_for('register'))

        weight_int = int(weight)
        if sex == "Чоловік":
            daily_goal = weight_int * 40
        else:
            daily_goal = weight_int * 30

        hashed_password = generate_password_hash(password)

        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            sex=sex,
            weight=weight
        )

        db.session.add(new_user)
        db.session.commit()

        user_settings = UserSettings(
            user_id=new_user.users_id,
            daily_goal_ml=daily_goal
        )
        db.session.add(user_settings)
        db.session.commit()

        flash("Реєстрація успішна! Тепер можете увійти", "success")
        return redirect(url_for('login'))

    return render_template("register.html", title="Register")


if __name__ == "__main__":
    app.run(debug=True)
